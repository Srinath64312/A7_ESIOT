from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models.alert import Alert
from app.models.prediction import AIPrediction
from app.services.websocket_manager import manager
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

async def get_alerts(db: AsyncSession, motor_id: int = None, skip: int = 0, limit: int = 100):
    query = select(Alert).order_by(Alert.timestamp.desc())
    count_query = select(func.count(Alert.id))
    
    if motor_id is not None:
        query = query.filter(Alert.motor_id == motor_id)
        count_query = count_query.filter(Alert.motor_id == motor_id)
        
    result = await db.execute(query.offset(skip).limit(limit))
    items = result.scalars().all()
    
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0
    
    return {"items": items, "total": total}

async def resolve_alert(db: AsyncSession, alert_id: int):
    result = await db.execute(select(Alert).filter(Alert.id == alert_id))
    alert = result.scalars().first()
    if alert:
        alert.resolved = True
        alert.resolved_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(alert)
    return alert

async def process_prediction_for_alerts(db: AsyncSession, prediction: AIPrediction):
    if prediction.severity in ["WARNING", "CRITICAL", "HIGH"] or prediction.health_score < 70:
        alert = Alert(
            motor_id=prediction.motor_id,
            alert_type="AI_ANOMALY_DETECTED",
            severity=prediction.severity,
            message=f"[{prediction.predicted_condition}] {prediction.recommendation}",
            timestamp=prediction.timestamp
        )
        db.add(alert)
        await db.commit()
        await db.refresh(alert)
        
        # Broadcast alert
        await manager.broadcast_json({
            "type": "alert",
            "data": {
                "id": alert.id,
                "motor_id": alert.motor_id,
                "severity": alert.severity,
                "message": alert.message
            }
        })
        return alert
    return None
