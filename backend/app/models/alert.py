from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    motor_id = Column(Integer, ForeignKey("motors.id"), nullable=False)
    alert_type = Column(String, nullable=False)
    severity = Column(String, nullable=False) # 'INFO', 'WARNING', 'CRITICAL'
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
