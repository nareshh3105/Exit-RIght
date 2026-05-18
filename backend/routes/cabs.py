from fastapi import APIRouter, Query

from services.cab_comparison_service import get_cab_providers

router = APIRouter()


@router.get("/cabs")
async def list_cabs(
    pickupLat: float = Query(...),
    pickupLng: float = Query(...),
    dropLat: float = Query(...),
    dropLng: float = Query(...),
):
    providers = get_cab_providers(pickupLat, pickupLng, dropLat, dropLng)
    return [p.model_dump() for p in providers]
