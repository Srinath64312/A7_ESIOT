from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, timezone
from typing import List, Optional

class ReadingBase(BaseModel):
    motor_id: int = 1
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    rpm: float
    current: float
    temperature: float
    vibration: float
    voltage: Optional[float] = 230.0
    load: Optional[float] = 50.0
    pwm_duty: Optional[float] = 80.0
    source: Optional[str] = "simulator"

class ReadingCreate(ReadingBase):
    pass

class ReadingResponse(ReadingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ReadingListResponse(BaseModel):
    items: List[ReadingResponse]
    total: int
