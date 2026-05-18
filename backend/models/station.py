from pydantic import BaseModel


class Station(BaseModel):
    id: str
    name: str
    line: str
    lat: float | None = None
    lng: float | None = None
    gate_count: int = 4
    zone: str | None = None
    distance_km: float | None = None


class ExitGate(BaseModel):
    id: str
    station_id: str
    gate_number: int
    label: str
    lat: float
    lng: float
    has_cover: bool = False
    has_cctv: bool = False
    lighting_score: int = 5
    accessibility: str = "stairs"


class TransportModeAvailability(BaseModel):
    mode: str
    available: bool
    avg_wait_minutes: int
    notes: str | None = None
