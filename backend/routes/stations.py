from fastapi import APIRouter

from db import get_supabase
from services.exit_direction_service import get_gates_for_station

router = APIRouter()


@router.get("/stations")
async def list_stations():
    sb = get_supabase()
    result = sb.table("stations").select("*").order("name").execute()
    return result.data


@router.get("/stations/{station_id}/gates")
async def get_station_gates(station_id: str):
    gates = get_gates_for_station(station_id)
    return [g.model_dump() for g in gates]
