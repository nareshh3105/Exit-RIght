from pydantic import BaseModel


class LatLng(BaseModel):
    lat: float
    lng: float


class RecommendationRequest(BaseModel):
    from_station_id: str
    to_destination: str
    to_lat_lng: LatLng | None = None
    user_id: str | None = None


class GateScore(BaseModel):
    gate: int
    is_recommended: bool = False
    extra_time: str | None = None
    status: str = "ok"
    reason: str | None = None


class GateRecommendation(BaseModel):
    recommended_gate: int
    reasons: list[str]
    alternate_gates: list[GateScore]


class TransportOption(BaseModel):
    mode: str
    name: str
    eta: str
    cost: str
    crowd_level: int = 1
    safety_score: int = 7
    confidence_percent: int = 80
    distance_km: float = 0.0
    is_recommended: bool = False
    is_cheapest: bool = False
    should_avoid: bool = False
    provider_route: str | None = None


class WeatherAlertResponse(BaseModel):
    type: str
    message: str
    minutes_away: int | None = None


class RecommendationResponse(BaseModel):
    id: str | None = None
    from_station_id: str
    from_station_name: str
    to_destination: str
    to_address: str
    distance_km: float
    gate_recommendation: GateRecommendation
    transport_options: list[TransportOption]
    weather_alert: WeatherAlertResponse | None = None
    ai_take: str | None = None
