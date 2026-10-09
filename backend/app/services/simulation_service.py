import asyncio
import random
import logging
from datetime import datetime, timezone
from app.schemas.reading import ReadingCreate
from app.services.reading_service import ingest_reading
from app.database import AsyncSessionLocal

logger = logging.getLogger(__name__)

class SimulationEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SimulationEngine, cls).__new__(cls)
            cls._instance.running = False
            cls._instance.scenario = "NORMAL"
            cls._instance.motor_id = None
            cls._instance.interval_ms = 1000
            cls._instance.tick_count = 0
            cls._instance.task = None
            cls._instance.scenarios_cycle = ["NORMAL", "OVERLOAD", "OVERHEATING", "HIGH_VIBRATION", "LOW_RPM", "CRITICAL"]
        return cls._instance

    def start(self, scenario: str, motor_id: int, interval_ms: int):
        self.scenario = scenario
        self.motor_id = motor_id
        self.interval_ms = interval_ms
        self.tick_count = 0
        
        if not self.running:
            self.running = True
            self.task = asyncio.create_task(self._run_loop())
            logger.info(f"Simulation started: Scenario {scenario} on Motor {motor_id}")

    def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()
            self.task = None
        logger.info("Simulation stopped")

    def get_status(self):
        return {
            "running": self.running,
            "scenario": self.scenario,
            "motor_id": self.motor_id,
            "tick_count": self.tick_count
        }

    async def _run_loop(self):
        while self.running:
            try:
                await self._generate_and_process_tick()
                self.tick_count += 1
                await asyncio.sleep(self.interval_ms / 1000.0)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Simulation tick error: {e}")

    async def _generate_and_process_tick(self):
        # Determine active scenario for AUTO
        active_scenario = self.scenario
        if self.scenario == "AUTO":
            idx = (self.tick_count // 30) % len(self.scenarios_cycle)
            active_scenario = self.scenarios_cycle[idx]

        reading_data = self._generate_telemetry(active_scenario)
        reading_create = ReadingCreate(**reading_data)

        async with AsyncSessionLocal() as db:
            await ingest_reading(db, reading_create)

    def _generate_telemetry(self, scenario: str) -> dict:
        base_temp = 50.0
        
        data = {
            "motor_id": self.motor_id,
            "timestamp": datetime.now(timezone.utc),
            "source": "simulation"
        }

        if scenario == "NORMAL":
            data.update({
                "rpm": random.gauss(1500, 50),
                "current": random.gauss(4.0, 0.5),
                "temperature": random.gauss(50, 5),
                "vibration": random.gauss(1.2, 0.3),
                "voltage": random.gauss(230, 5),
                "load": random.gauss(45, 5),
                "pwm_duty": random.gauss(80, 2)
            })
        elif scenario == "OVERLOAD":
            data.update({
                "rpm": random.gauss(1100, 100),
                "current": random.gauss(9.0, 2.0),
                "temperature": random.uniform(70, 90),
                "vibration": random.gauss(4.0, 1.0),
                "voltage": random.gauss(220, 10),
                "load": random.uniform(85, 100),
                "pwm_duty": 100.0
            })
        elif scenario == "OVERHEATING":
            temp = min(60 + (self.tick_count * 0.5), 110)
            data.update({
                "rpm": random.gauss(1400, 50),
                "current": random.gauss(5.0, 0.5),
                "temperature": temp + random.gauss(0, 2),
                "vibration": random.gauss(2.0, 0.5),
                "voltage": random.gauss(230, 5),
                "load": random.gauss(60, 5),
                "pwm_duty": random.gauss(85, 2)
            })
        elif scenario == "HIGH_VIBRATION":
            data.update({
                "rpm": random.gauss(1500, 200),
                "current": random.gauss(6.0, 1.5),
                "temperature": random.gauss(65, 5),
                "vibration": random.uniform(6.0, 15.0),
                "voltage": random.gauss(230, 5),
                "load": random.gauss(50, 10),
                "pwm_duty": random.gauss(80, 5)
            })
        elif scenario == "LOW_RPM":
            data.update({
                "rpm": random.uniform(400, 800),
                "current": random.gauss(7.0, 1.0),
                "temperature": random.gauss(60, 5),
                "vibration": random.gauss(3.0, 1.0),
                "voltage": random.gauss(225, 5),
                "load": random.gauss(75, 5),
                "pwm_duty": random.uniform(55, 70)
            })
        elif scenario == "CRITICAL":
            data.update({
                "rpm": random.uniform(0, 500),
                "current": random.uniform(10.0, 20.0),
                "temperature": random.uniform(90, 120),
                "vibration": random.uniform(10.0, 25.0),
                "voltage": random.uniform(190, 210),
                "load": random.uniform(95, 100),
                "pwm_duty": 100.0
            })
        else:
            # Fallback normal
            data.update({
                "rpm": 1500, "current": 4.0, "temperature": 50, 
                "vibration": 1.2, "voltage": 230, "load": 45, "pwm_duty": 80
            })

        # ensure positive values where it matters
        data["rpm"] = max(0, data["rpm"])
        data["current"] = max(0, data["current"])
        data["vibration"] = max(0, data["vibration"])
        
        return data

simulation_engine = SimulationEngine()
