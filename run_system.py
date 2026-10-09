"""
AI-MotorGuard - Complete System Launcher
Launches FastAPI Backend, React Dashboard, and Motor Simulator with one command.
"""

import sys
import time
import subprocess
import argparse
import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")


def start_backend():
    print("[+] Launching FastAPI Backend on http://localhost:8000 ...")
    cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"]
    return subprocess.Popen(cmd, cwd=BACKEND_DIR)


def start_frontend():
    print("[+] Launching React Dashboard on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    cmd = [npm_cmd, "run", "dev"]
    return subprocess.Popen(cmd, cwd=FRONTEND_DIR)


def start_simulator(scenario="AUTO", interval=1.0):
    print(f"[+] Launching Motor Simulator (Mode: {scenario}, Interval: {interval}s) ...")
    cmd = [sys.executable, "simulator.py", "--scenario", scenario, "--interval", str(interval)]
    return subprocess.Popen(cmd, cwd=PROJECT_ROOT)


def main():
    parser = argparse.ArgumentParser(description="AI-MotorGuard System Orchestrator")
    parser.add_argument("--no-frontend", action="store_true", help="Do not start frontend")
    parser.add_argument("--no-backend", action="store_true", help="Do not start backend")
    parser.add_argument("--simulate", action="store_true", help="Also start the standalone motor simulator")
    parser.add_argument("--scenario", default="AUTO", help="Simulator scenario (NORMAL, OVERLOAD, OVERHEATING, HIGH_VIBRATION, LOW_RPM, CRITICAL, AUTO)")
    parser.add_argument("--interval", type=float, default=1.0, help="Simulator interval in seconds")
    args = parser.parse_args()

    print("=" * 70)
    print("      AI-MOTORGUARD - Industrial Motor Predictive Maintenance")
    print("=" * 70)

    processes = []

    try:
        if not args.no_backend:
            proc_be = start_backend()
            processes.append(("Backend", proc_be))
            time.sleep(2)  # Give backend a moment to boot

        if not args.no_frontend:
            proc_fe = start_frontend()
            processes.append(("Frontend", proc_fe))

        if args.simulate:
            time.sleep(1)
            proc_sim = start_simulator(args.scenario, args.interval)
            processes.append(("Simulator", proc_sim))

        print("\nAll requested services are running!")
        print("  Backend API & Docs : http://localhost:8000/docs")
        print("  React UI Dashboard : http://localhost:5173")
        print("  WebSocket Stream   : ws://localhost:8000/ws/telemetry")
        print("\nPress Ctrl+C to terminate all services safely.\n")

        while True:
            time.sleep(1)
            for name, proc in processes:
                if proc.poll() is not None:
                    print(f"[!] Warning: {name} process exited unexpectedly with code {proc.returncode}")

    except KeyboardInterrupt:
        print("\nShutting down all AI-MotorGuard services...")
        for name, proc in processes:
            print(f"Terminating {name}...")
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()
        print("All services stopped.")


if __name__ == "__main__":
    main()
