from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, JSON, Index
from app.database import Base

class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    motor_id = Column(Integer, ForeignKey("motors.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    health_score = Column(Float, nullable=False)
    anomaly_probability = Column(Float, nullable=False)
    predicted_condition = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    recommendation = Column(Text, nullable=False)
    model_version = Column(String, nullable=False)
    feature_importance = Column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_prediction_motor_timestamp", "motor_id", "timestamp"),
    )
