from fastapi import APIRouter
from app.schemas.simulation import SimulationStartRequest, SimulationStatusResponse
from app.services.simulation_service import simulation_engine

router = APIRouter(prefix="/simulation", tags=["simulation"])

@router.post("/start", response_model=SimulationStatusResponse)
async def start_simulation(request: SimulationStartRequest):
    simulation_engine.start(
        scenario=request.scenario,
        motor_id=request.motor_id,
        interval_ms=request.interval_ms,
        temp_offset=request.temp_offset,
        vib_offset=request.vib_offset
    )
    return simulation_engine.get_status()

@router.post("/stop", response_model=SimulationStatusResponse)
async def stop_simulation():
    simulation_engine.stop()
    return simulation_engine.get_status()

@router.get("/status", response_model=SimulationStatusResponse)
async def simulation_status():
    return simulation_engine.get_status()
