from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Any, Dict, Optional

class PredictionResponse(BaseModel):
    id: int
    motor_id: int
    timestamp: datetime
    health_score: float
    anomaly_probability: float
    predicted_condition: str
    severity: str
    recommendation: str
    model_version: str
    feature_importance: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)

class HealthResponse(BaseModel):
    motor_id: int
    status: str
    latest_prediction: Optional[PredictionResponse] = None
