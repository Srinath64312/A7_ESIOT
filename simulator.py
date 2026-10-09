"""
AI-MotorGuard: Standalone Industrial Motor Simulator
Simulates real-time telemetry (RPM, Current, Temperature, Vibration)
and streams it to the FastAPI backend.
"""

import sys
import time
import math
import random
import argparse
import datetime
import urllib.request
import urllib.error
import json

SCENARIOS = {
    "NORMAL": {
        "desc": "Normal steady-state operation",
        "rpm": (1480, 1520),
        "current": (3.8, 4.3),
        "temp": (48.0, 53.0),
        "vibration": (0.8, 1.4),
        "voltage": (228.0, 232.0),
        "load": (40.0, 48.0),
        "pwm_duty": (78.0, 82.0)
    },
    "OVERLOAD": {
        "desc": "Mechanical overload - high current & sagging RPM",
        "rpm": (1050, 1250),
        "current": (8.5, 14.0),
        "temp": (72.0, 88.0),
        "vibration": (3.2, 5.5),
        "voltage": (215.0, 225.0),
        "load": (88.0, 100.0),
        "pwm_duty": (98.0, 100.0)
    },
    "OVERHEATING": {
        "desc": "Thermal runaway / cooling failure - high temperature",
        "rpm": (1420, 1490),
        "current": (4.8, 6.0),
        "temp": (85.0, 115.0),
        "vibration": (1.8, 2.8),
        "voltage": (226.0, 230.0),
        "load": (55.0, 68.0),
        "pwm_duty": (82.0, 88.0)
    },
    "HIGH_VIBRATION": {
        "desc": "Bearing wear / misalignment / unbalance",
        "rpm": (1400, 1550),
        "current": (5.0, 7.5),
        "temp": (62.0, 74.0),
        "vibration": (6.5, 16.0),
        "voltage": (225.0, 230.0),
        "load": (48.0, 65.0),
        "pwm_duty": (75.0, 85.0)
    },
    "LOW_RPM": {
        "desc": "Under-speed / phase drop / heavy mechanical drag",
        "rpm": (420, 780),
        "current": (6.5, 8.5),
        "temp": (58.0, 68.0),
        "vibration": (2.5, 4.2),
        "voltage": (210.0, 222.0),
        "load": (70.0, 82.0),
        "pwm_duty": (55.0, 70.0)
    },
    "CRITICAL": {
        "desc": "Cascading multi-failure breakdown",
        "rpm": (150, 480),
        "current": (12.0, 22.0),
        "temp": (95.0, 125.0),
        "vibration": (12.0, 25.0),
        "voltage": (195.0, 215.0),
        "load": (95.0, 100.0),
        "pwm_duty": (100.0, 100.0)
    }
}

CYCLE_ORDER = ["NORMAL", "OVERLOAD", "OVERHEATING", "HIGH_VIBRATION", "LOW_RPM", "CRITICAL"]


def generate_reading(scenario_name: str, motor_id: int, tick: int) -> dict:
    profile = SCENARIOS.get(scenario_name, SCENARIOS["NORMAL"])
    
    # Introduce slight smooth sinusoidal variation
    wobble = math.sin(tick * 0.2) * 0.05
    
    rpm = random.uniform(*profile["rpm"]) * (1.0 + wobble)
    current = random.uniform(*profile["current"]) * (1.0 + wobble * 0.5)
    temp = random.uniform(*profile["temp"])
    vibration = random.uniform(*profile["vibration"])
    voltage = random.uniform(*profile["voltage"])
    load = random.uniform(*profile["load"])
    pwm_duty = random.uniform(*profile["pwm_duty"])
    
    # In OVERHEATING, ramp up over time
    if scenario_name == "OVERHEATING":
        ramp = min(35.0, tick * 0.8)
        temp += ramp

    return {
        "motor_id": motor_id,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "rpm": round(max(0.0, rpm), 1),
        "current": round(max(0.0, current), 2),
        "temperature": round(max(0.0, temp), 1),
        "vibration": round(max(0.0, vibration), 2),
        "voltage": round(max(0.0, voltage), 1),
        "load": round(min(100.0, max(0.0, load)), 1),
        "pwm_duty": round(min(100.0, max(0.0, pwm_duty)), 1),
        "source": "motor_simulator"
    }


def send_telemetry(api_url: str, payload: dict) -> tuple[int, str]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            return resp.status, resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 0, str(e)


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
    parser = argparse.ArgumentParser(description="AI-MotorGuard Motor Simulator")
    parser.add_argument("--url", default="http://localhost:8000/api/readings", help="Backend readings API URL")
    parser.add_argument("--motor-id", type=int, default=1, help="Target motor ID (default: 1)")
    parser.add_argument("--interval", type=float, default=1.0, help="Interval between ticks in seconds (default: 1.0)")
    parser.add_argument("--scenario", default="NORMAL", choices=list(SCENARIOS.keys()) + ["AUTO"], help="Fault scenario")
    parser.add_argument("--ticks", type=int, default=0, help="Number of ticks to run (0 = infinite)")
    args = parser.parse_args()

    print("=" * 70)
    print(" [AI-MOTORGUARD] Industrial Motor Telemetry Simulator")
    print("=" * 70)
    print(f" Target Endpoint : {args.url}")
    print(f" Target Motor ID : {args.motor_id}")
    print(f" Initial Scenario: {args.scenario}")
    print(f" Streaming Rate  : {1.0 / args.interval:.1f} Hz (every {args.interval}s)")
    print(" Available Modes : " + ", ".join(SCENARIOS.keys()) + ", AUTO")
    print(" Press Ctrl+C at any time to halt.")
    print("=" * 70)

    tick = 0
    auto_cycle_idx = 0
    scenario = args.scenario

    try:
        while True:
            tick += 1
            if args.scenario == "AUTO":
                # Change scenario every 20 ticks
                auto_cycle_idx = (tick // 20) % len(CYCLE_ORDER)
                scenario = CYCLE_ORDER[auto_cycle_idx]

            payload = generate_reading(scenario, args.motor_id, tick)
            code, resp = send_telemetry(args.url, payload)

            status_str = f"HTTP {code}" if code else f"ERR: {resp}"
            color = "\033[92m" if code == 200 else "\033[91m"
            reset = "\033[0m"

            print(
                f"[{datetime.datetime.now().strftime('%H:%M:%S')}] "
                f"Tick #{tick:04d} | "
                f"Mode: {scenario:<14} | "
                f"RPM: {payload['rpm']:>6.1f} | "
                f"Curr: {payload['current']:>5.2f}A | "
                f"Temp: {payload['temperature']:>5.1f}°C | "
                f"Vib: {payload['vibration']:>5.2f}mm/s | "
                f"{color}{status_str}{reset}"
            )

            if args.ticks > 0 and tick >= args.ticks:
                print(f"Completed requested {args.ticks} ticks.")
                break

            time.sleep(args.interval)

    except KeyboardInterrupt:
        print("\nSimulator stopped by user.")


if __name__ == "__main__":
    main()
