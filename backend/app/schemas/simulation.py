from pydantic import BaseModel

class SimulationStartRequest(BaseModel):
    scenario: str
    motor_id: int
    interval_ms: int = 1000

class SimulationStatusResponse(BaseModel):
    running: bool
    scenario: str | None
    motor_id: int | None
    tick_count: int
