from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.prediction import PredictionResponse, HealthResponse
from app.services import prediction_service

router = APIRouter(prefix="/motors", tags=["predictions"])

@router.get("/{motor_id}/prediction", response_model=PredictionResponse)
async def get_latest_prediction(motor_id: int, db: AsyncSession = Depends(get_db)):
    prediction = await prediction_service.get_latest_prediction(db, motor_id)
    if not prediction:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No predictions found for this motor")
    return prediction

@router.get("/{motor_id}/health", response_model=HealthResponse)
async def get_motor_health(motor_id: int, db: AsyncSession = Depends(get_db)):
    prediction = await prediction_service.get_latest_prediction(db, motor_id)
    status = "UNKNOWN"
    if prediction:
        status = "HEALTHY" if prediction.severity == "INFO" else prediction.severity
    return HealthResponse(motor_id=motor_id, status=status, latest_prediction=prediction)
