import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.prediction import AIPrediction
from app.schemas.reading import ReadingCreate
from app.config import settings
from datetime import datetime

logger = logging.getLogger(__name__)


class MockAIEngine:
    """Heuristic-based fallback when trained AI models are not available."""

    def predict(self, telemetry_dict):
        rpm = telemetry_dict.get('rpm', 1500)
        temp = telemetry_dict.get('temperature', 50)
        current = telemetry_dict.get('current', 4.0)
        vibration = telemetry_dict.get('vibration', 1.0)

        health_score = 100.0
        anomaly_prob = 0.0
        condition = "NORMAL"
        severity = "LOW"
        recommendation = "Motor operating within expected parameters. Continue normal monitoring."

        if temp > 90 or vibration > 10.0 or current > 12.0 or rpm < 400:
            health_score = 20.0
            anomaly_prob = 0.95
            condition = "CRITICAL"
            severity = "HIGH"
            recommendation = "SHUTDOWN IMMEDIATELY. Multiple critical parameters detected. Complete maintenance required."
        elif temp > 80 or current > 8.0:
            health_score = 45.0
            anomaly_prob = 0.75
            condition = "OVERLOAD" if current > 8.0 else "OVERHEATING"
            severity = "HIGH"
            recommendation = "Reduce load and inspect motor immediately." if current > 8.0 else "Check cooling system. Stop if temperature exceeds 90°C."
        elif vibration > 5.0:
            health_score = 55.0
            anomaly_prob = 0.6
            condition = "HIGH_VIBRATION"
            severity = "MEDIUM"
            recommendation = "Check bearings and mounting alignment. Schedule maintenance."
        elif rpm < 1000:
            health_score = 60.0
            anomaly_prob = 0.5
            condition = "LOW_RPM"
            severity = "MEDIUM"
            recommendation = "Check power supply, motor windings, and mechanical load."
        elif temp > 65 or vibration > 3.0:
            health_score = 75.0
            anomaly_prob = 0.3
            condition = "WARNING"
            severity = "MEDIUM"
            recommendation = "Parameters trending outside normal range. Schedule inspection."

        return {
            "health_score": health_score,
            "anomaly_probability": anomaly_prob,
            "predicted_condition": condition,
            "severity": severity,
            "recommendation": recommendation,
            "feature_contributions": {
                "current": 0.32, "vibration": 0.28, "temperature": 0.20,
                "rpm_deviation": 0.10, "voltage": 0.05, "load": 0.05
            }
        }


def _create_engine():
    """Attempt to load real AI engine; fall back to heuristic mock."""
    try:
        from app.ai.engine import AIEngine
        real_engine = AIEngine()
        if real_engine.predictor is not None:
            # Verify models are loaded by doing a test prediction
            test_result = real_engine.predict({
                "rpm": 1500, "current": 4.0, "temperature": 50,
                "vibration": 1.0, "voltage": 230, "load": 45, "pwm_duty": 50
            })
            if "error" not in test_result:
                logger.info("AI Engine loaded successfully with trained models")
                return real_engine
    except Exception as e:
        logger.warning(f"Could not load AI Engine: {e}")
    logger.info("Using heuristic fallback AI engine")
    return MockAIEngine()


engine = _create_engine()

async def create_prediction(db: AsyncSession, motor_id: int, telemetry: ReadingCreate):
    prediction_result = engine.predict(telemetry.model_dump())
    
    db_pred = AIPrediction(
        motor_id=motor_id,
        timestamp=telemetry.timestamp,
        health_score=prediction_result["health_score"],
        anomaly_probability=prediction_result["anomaly_probability"],
        predicted_condition=prediction_result["predicted_condition"],
        severity=prediction_result["severity"],
        recommendation=prediction_result["recommendation"],
        model_version=settings.AI_MODEL_VERSION,
        feature_importance=prediction_result["feature_contributions"]
    )
    db.add(db_pred)
    await db.commit()
    await db.refresh(db_pred)
    return db_pred

async def get_latest_prediction(db: AsyncSession, motor_id: int):
    query = select(AIPrediction).filter(AIPrediction.motor_id == motor_id).order_by(AIPrediction.timestamp.desc()).limit(1)
    result = await db.execute(query)
    return result.scalars().first()
