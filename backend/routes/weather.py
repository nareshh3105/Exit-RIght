from fastapi import APIRouter

from services.weather_service import get_weather_for_station

router = APIRouter()


@router.get("/weather/{station_id}")
async def get_weather(station_id: str):
    data = await get_weather_for_station(station_id)
    return data.model_dump()
