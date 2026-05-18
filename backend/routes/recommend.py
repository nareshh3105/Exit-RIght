from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.recommendation_engine import generate_recommendation
from models.recommendation import RecommendationRequest

router = APIRouter()


class RecommendBody(BaseModel):
    fromStationId: str
    toDestination: str
    toLatLng: dict | None = None


@router.post("/recommend")
async def recommend(body: RecommendBody):
    from models.recommendation import LatLng

    lat_lng = None
    if body.toLatLng and "lat" in body.toLatLng and "lng" in body.toLatLng:
        lat_lng = LatLng(lat=body.toLatLng["lat"], lng=body.toLatLng["lng"])

    req = RecommendationRequest(
        from_station_id=body.fromStationId,
        to_destination=body.toDestination,
        to_lat_lng=lat_lng,
    )

    try:
        result = await generate_recommendation(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return result.model_dump(by_alias=True)
