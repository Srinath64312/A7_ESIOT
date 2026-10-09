from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

class AlertBase(BaseModel):
    motor_id: int
    alert_type: str
    severity: str
    message: str
    timestamp: datetime
    resolved: bool = False
    resolved_at: Optional[datetime] = None

class AlertResponse(AlertBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class AlertListResponse(BaseModel):
    items: List[AlertResponse]
    total: int
