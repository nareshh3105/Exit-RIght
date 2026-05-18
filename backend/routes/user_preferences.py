from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import get_supabase

router = APIRouter()


class PreferencesBody(BaseModel):
    user_id: str
    time_sensitivity: float = 0.5
    cost_sensitivity: float = 0.5
    safety_sensitivity: float = 0.5
    comfort_sensitivity: float = 0.5
    avoided_modes: list[str] = []


@router.get("/preferences/{user_id}")
async def get_preferences(user_id: str):
    sb = get_supabase()
    result = sb.table("user_preferences").select("*").eq("user_id", user_id).maybe_single().execute()

    if not result.data:
        return {
            "user_id": user_id,
            "time_sensitivity": 0.5,
            "cost_sensitivity": 0.5,
            "safety_sensitivity": 0.5,
            "comfort_sensitivity": 0.5,
            "avoided_modes": [],
            "preferred_gates": {},
        }

    return result.data


@router.put("/preferences")
async def update_preferences(body: PreferencesBody):
    sb = get_supabase()

    for field in ["time_sensitivity", "cost_sensitivity", "safety_sensitivity", "comfort_sensitivity"]:
        val = getattr(body, field)
        if val < 0 or val > 1:
            raise HTTPException(status_code=400, detail=f"{field} must be between 0 and 1")

    data = {
        "user_id": body.user_id,
        "time_sensitivity": body.time_sensitivity,
        "cost_sensitivity": body.cost_sensitivity,
        "safety_sensitivity": body.safety_sensitivity,
        "comfort_sensitivity": body.comfort_sensitivity,
        "avoided_modes": body.avoided_modes,
    }

    result = sb.table("user_preferences").upsert(data, on_conflict="user_id").execute()
    return {"success": True, "data": result.data[0] if result.data else data}
