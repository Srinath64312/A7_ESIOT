from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.reading import ReadingCreate, ReadingResponse, ReadingListResponse
from app.services import reading_service

router = APIRouter(tags=["readings"])

@router.post("/readings", response_model=ReadingResponse)
async def create_reading(reading: ReadingCreate, db: AsyncSession = Depends(get_db)):
    db_reading, _ = await reading_service.ingest_reading(db, reading)
    return db_reading

@router.get("/motors/{motor_id}/readings", response_model=ReadingListResponse)
async def get_motor_readings(motor_id: int, skip: int = Query(0, ge=0), limit: int = Query(100, ge=1), db: AsyncSession = Depends(get_db)):
    return await reading_service.get_readings(db, motor_id, skip=skip, limit=limit)
