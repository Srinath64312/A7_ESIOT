from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

class MotorBase(BaseModel):
    name: str
    model: str
    location: str
    status: Optional[str] = "offline"

class MotorCreate(MotorBase):
    pass

class MotorUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

class MotorResponse(MotorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MotorListResponse(BaseModel):
    items: List[MotorResponse]
    total: int
