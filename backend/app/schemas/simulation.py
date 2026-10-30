from pydantic import BaseModel
from typing import Optional

class SimulationStartRequest(BaseModel):
    scenario: str
    motor_id: int
    interval_ms: int = 1000
    temp_offset: Optional[float] = 0.0
    vib_offset: Optional[float] = 0.0

class SimulationStatusResponse(BaseModel):
    running: bool
    scenario: str | None
    motor_id: int | None
    tick_count: int
    temp_offset: float | None = 0.0
    vib_offset: float | None = 0.0
