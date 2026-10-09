import pytest
from datetime import datetime, timezone

@pytest.mark.asyncio
async def test_health_check(async_client):
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

@pytest.mark.asyncio
async def test_create_and_get_motors(async_client):
    motor_data = {"name": "TestMotor", "model": "TestModel", "location": "TestLoc"}
    response = await async_client.post("/api/motors", json=motor_data)
    assert response.status_code == 200
    motor_id = response.json()["id"]

    response2 = await async_client.get("/api/motors")
    assert response2.status_code == 200
    assert len(response2.json()["items"]) > 0

@pytest.mark.asyncio
async def test_post_and_get_reading(async_client):
    # First create a motor
    motor_res = await async_client.post("/api/motors", json={"name": "M2", "model": "m", "location": "l"})
    m_id = motor_res.json()["id"]

    reading_data = {
        "motor_id": m_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "rpm": 1500, "current": 4.0, "temperature": 50, 
        "vibration": 1.2, "voltage": 230, "load": 45, "pwm_duty": 80,
        "source": "hardware"
    }

    res_post = await async_client.post("/api/readings", json=reading_data)
    assert res_post.status_code == 200

    res_get = await async_client.get(f"/api/motors/{m_id}/readings")
    assert res_get.status_code == 200
    assert res_get.json()["total"] == 1

@pytest.mark.asyncio
async def test_simulation_start_stop(async_client):
    motor_res = await async_client.post("/api/motors", json={"name": "M3", "model": "m", "location": "l"})
    m_id = motor_res.json()["id"]
    
    res = await async_client.post("/api/simulation/start", json={"scenario": "NORMAL", "motor_id": m_id, "interval_ms": 100})
    assert res.status_code == 200
    assert res.json()["running"] is True

    res2 = await async_client.post("/api/simulation/stop")
    assert res2.status_code == 200
    assert res2.json()["running"] is False
