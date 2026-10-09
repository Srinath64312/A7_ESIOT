from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models.motor import Motor
from app.schemas.motor import MotorCreate, MotorUpdate
from fastapi import HTTPException

async def get_motor(db: AsyncSession, motor_id: int):
    result = await db.execute(select(Motor).filter(Motor.id == motor_id))
    motor = result.scalars().first()
    if not motor:
        raise HTTPException(status_code=404, detail="Motor not found")
    return motor

async def get_motors(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Motor).offset(skip).limit(limit))
    items = result.scalars().all()
    count_result = await db.execute(select(func.count(Motor.id)))
    total = count_result.scalar() or 0
    return {"items": items, "total": total}

async def create_motor(db: AsyncSession, motor: MotorCreate):
    db_motor = Motor(**motor.model_dump())
    db.add(db_motor)
    await db.commit()
    await db.refresh(db_motor)
    return db_motor

async def update_motor(db: AsyncSession, motor_id: int, motor_update: MotorUpdate):
    db_motor = await get_motor(db, motor_id)
    update_data = motor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_motor, key, value)
    await db.commit()
    await db.refresh(db_motor)
    return db_motor

async def delete_motor(db: AsyncSession, motor_id: int):
    db_motor = await get_motor(db, motor_id)
    await db.delete(db_motor)
    await db.commit()
    return True
