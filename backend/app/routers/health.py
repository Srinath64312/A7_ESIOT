from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"
        
    return {
        "status": "online",
        "database": db_status,
        "ai_engine": "mock_loaded" # Fallback status
    }
