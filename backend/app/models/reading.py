from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Index
from app.database import Base

class MotorReading(Base):
    __tablename__ = "motor_readings"

    id = Column(Integer, primary_key=True, index=True)
    motor_id = Column(Integer, ForeignKey("motors.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    rpm = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    vibration = Column(Float, nullable=False)
    voltage = Column(Float, nullable=False)
    load = Column(Float, nullable=False)
    pwm_duty = Column(Float, nullable=False)
    source = Column(String, nullable=False) # 'simulation' | 'hardware'

    __table_args__ = (
        Index("idx_motor_timestamp", "motor_id", "timestamp"),
    )
