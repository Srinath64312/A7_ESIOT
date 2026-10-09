import pytest
from app.services.simulation_service import simulation_engine

def test_simulation_scenario_normal():
    simulation_engine.motor_id = 1
    data = simulation_engine._generate_telemetry("NORMAL")
    assert 1300 <= data["rpm"] <= 1700
    assert 2.0 <= data["current"] <= 6.0
    assert 30 <= data["temperature"] <= 70

def test_simulation_scenario_overheating():
    simulation_engine.motor_id = 1
    simulation_engine.tick_count = 50 # advance tick to increase temp
    data = simulation_engine._generate_telemetry("OVERHEATING")
    assert data["temperature"] >= 80

def test_simulation_scenario_critical():
    simulation_engine.motor_id = 1
    data = simulation_engine._generate_telemetry("CRITICAL")
    assert data["temperature"] >= 90
    assert data["pwm_duty"] == 100.0
