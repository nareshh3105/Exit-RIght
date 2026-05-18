from fastapi import APIRouter

from models.safety import SafetyScoreRequest
from services.safety_service import get_safety_score

router = APIRouter()


@router.post("/safety/score")
async def safety_score(body: SafetyScoreRequest):
    result = await get_safety_score(
        station_id=body.station_id,
        gate_number=body.gate_number,
        mode=body.mode,
        destination_lat=body.destination_lat,
        destination_lng=body.destination_lng,
    )
    return result.model_dump()
