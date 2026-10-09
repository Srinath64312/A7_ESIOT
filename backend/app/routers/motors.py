from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.motor import MotorCreate, MotorUpdate, MotorResponse, MotorListResponse
from app.services import motor_service

router = APIRouter(prefix="/motors", tags=["motors"])

@router.post("", response_model=MotorResponse)
async def create_motor(motor: MotorCreate, db: AsyncSession = Depends(get_db)):
    return await motor_service.create_motor(db, motor)

@router.get("", response_model=MotorListResponse)
async def get_motors(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1), db: AsyncSession = Depends(get_db)):
    return await motor_service.get_motors(db, skip=skip, limit=limit)

@router.get("/{motor_id}", response_model=MotorResponse)
async def get_motor(motor_id: int, db: AsyncSession = Depends(get_db)):
    return await motor_service.get_motor(db, motor_id)

@router.put("/{motor_id}", response_model=MotorResponse)
async def update_motor(motor_id: int, motor: MotorUpdate, db: AsyncSession = Depends(get_db)):
    return await motor_service.update_motor(db, motor_id, motor)

@router.delete("/{motor_id}")
async def delete_motor(motor_id: int, db: AsyncSession = Depends(get_db)):
    return await motor_service.delete_motor(db, motor_id)
