from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.alert import AlertResponse, AlertListResponse
from app.services import alert_service

router = APIRouter(tags=["alerts"])

@router.get("/alerts", response_model=AlertListResponse)
async def get_all_alerts(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1), db: AsyncSession = Depends(get_db)):
    return await alert_service.get_alerts(db, skip=skip, limit=limit)

@router.get("/motors/{motor_id}/alerts", response_model=AlertListResponse)
async def get_motor_alerts(motor_id: int, skip: int = Query(0, ge=0), limit: int = Query(100, ge=1), db: AsyncSession = Depends(get_db)):
    return await alert_service.get_alerts(db, motor_id=motor_id, skip=skip, limit=limit)

@router.post("/alerts/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    alert = await alert_service.resolve_alert(db, alert_id)
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
