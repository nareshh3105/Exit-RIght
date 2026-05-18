from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import get_supabase

router = APIRouter()


class FeedbackBody(BaseModel):
    recommendation_id: str
    user_id: str
    rating: int
    feedback_type: str = "helpful"
    comment: str | None = None


@router.post("/feedback")
async def submit_feedback(body: FeedbackBody):
    if body.rating < 1 or body.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    sb = get_supabase()
    result = sb.table("feedback_logs").insert({
        "recommendation_id": body.recommendation_id,
        "user_id": body.user_id,
        "rating": body.rating,
        "feedback_type": body.feedback_type,
        "comment": body.comment,
    }).execute()

    return {"success": True, "id": result.data[0]["id"] if result.data else None}
