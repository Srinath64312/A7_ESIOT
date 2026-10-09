import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.models.motor import Motor
from sqlalchemy.future import select

from app.routers import health, motors, readings, predictions, alerts, simulation
from app.services.websocket_manager import manager
from app.services.simulation_service import simulation_engine
from app.utils.logging import setup_logging

setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up AI-MotorGuard Backend...")
    await init_db()
    
    # Create default motor if none exists
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Motor).limit(1))
        if not result.scalars().first():
            logger.info("Creating default motor...")
            default_motor = Motor(name="MTR-001", model="Induction AC", location="Plant A, Line 1", status="online")
            db.add(default_motor)
            await db.commit()

    yield
    
    # Shutdown
    logger.info("Shutting down AI-MotorGuard Backend...")
    simulation_engine.stop()

app = FastAPI(title="AI-MotorGuard API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api")
app.include_router(motors.router, prefix="/api")
app.include_router(readings.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep alive and receive simple messages if needed
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Welcome to AI-MotorGuard Backend API", "version": "1.0.0"}
