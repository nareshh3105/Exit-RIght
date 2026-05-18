from pydantic import BaseModel


class SafetyFactor(BaseModel):
    label: str
    score: float
    tone: str  # good | ok | bad
    icon: str


class SafetyScoreRequest(BaseModel):
    station_id: str
    gate_number: int
    destination_lat: float
    destination_lng: float
    mode: str = "cab"


class SafetyScoreResponse(BaseModel):
    overall_score: float
    tone: str
    factors: list[SafetyFactor]
