from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models.reading import MotorReading
from app.schemas.reading import ReadingCreate

import logging

logger = logging.getLogger(__name__)

async def create_reading(db: AsyncSession, reading: ReadingCreate):
    db_reading = MotorReading(**reading.model_dump())
    db.add(db_reading)
    await db.commit()
    await db.refresh(db_reading)
    return db_reading

async def ingest_reading(db: AsyncSession, reading: ReadingCreate):
    # 1. Save reading to DB
    db_reading = await create_reading(db, reading)
    
    # 2. Compute AI prediction & save
    prediction = None
    try:
        from app.services.prediction_service import create_prediction
        prediction = await create_prediction(db, reading.motor_id, reading)
        
        # 3. Process alerts
        from app.services.alert_service import process_prediction_for_alerts
        await process_prediction_for_alerts(db, prediction)
    except Exception as e:
        logger.error(f"Error computing prediction or alert: {e}")

    # 4. Broadcast via WebSocket
    try:
        from app.services.websocket_manager import manager
        await manager.broadcast_json({
            "type": "telemetry",
            "data": {
                "motor_id": reading.motor_id,
                "rpm": reading.rpm,
                "current": reading.current,
                "temperature": reading.temperature,
                "vibration": reading.vibration,
                "voltage": reading.voltage,
                "load": reading.load,
                "pwm_duty": reading.pwm_duty,
                "timestamp": db_reading.timestamp.isoformat()
            }
        })
        if prediction:
            await manager.broadcast_json({
                "type": "prediction",
                "data": {
                    "motor_id": reading.motor_id,
                    "health_score": prediction.health_score,
                    "anomaly_probability": prediction.anomaly_probability,
                    "predicted_condition": prediction.predicted_condition,
                    "severity": prediction.severity,
                    "recommendation": prediction.recommendation,
                    "feature_importance": prediction.feature_importance
                }
            })
    except Exception as e:
        logger.error(f"Error broadcasting WebSocket message: {e}")

    return db_reading, prediction

async def get_readings(db: AsyncSession, motor_id: int, skip: int = 0, limit: int = 100):
    query = select(MotorReading).filter(MotorReading.motor_id == motor_id).order_by(MotorReading.timestamp.desc())
    result = await db.execute(query.offset(skip).limit(limit))
    items = result.scalars().all()
    
    count_query = select(func.count(MotorReading.id)).filter(MotorReading.motor_id == motor_id)
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0
    
    return {"items": items, "total": total}
