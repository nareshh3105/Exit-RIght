from fastapi import APIRouter

from services.crowd_service import get_crowd_levels

router = APIRouter()


@router.get("/crowd/{station_id}")
async def get_crowd(station_id: str):
    levels = get_crowd_levels(station_id)
    return {"station_id": station_id, "gates": levels}
