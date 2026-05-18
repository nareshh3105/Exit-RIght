from datetime import datetime, timezone

from db import get_supabase
from models.safety import SafetyFactor, SafetyScoreResponse
from services.crowd_service import get_crowd_levels
from services.weather_service import get_weather_for_station

MODE_BASE_SCORE = {"cab": 8, "bus": 7, "auto": 6, "walk": 5}
MODE_COMFORT = {"cab": 0.9, "auto": 0.5, "bus": 0.4, "walk": 0.3}


def _time_modifier(hour: int) -> float:
    if 6 <= hour < 20:
        return 0.0
    if 20 <= hour < 22:
        return -1.0
    if 22 <= hour or hour < 2:
        return -2.0
    return -3.0


def _tone(score: float) -> str:
    if score >= 7:
        return "good"
    if score >= 4:
        return "ok"
    return "bad"


async def get_safety_score(
    station_id: str,
    gate_number: int,
    mode: str,
    destination_lat: float | None = None,
    destination_lng: float | None = None,
) -> SafetyScoreResponse:
    sb = get_supabase()
    now = datetime.now(timezone.utc)

    gate_row = (
        sb.table("exit_gates")
        .select("lighting_score, has_cctv, has_cover")
        .eq("station_id", station_id)
        .eq("gate_number", gate_number)
        .maybe_single()
        .execute()
    )
    gate = gate_row.data or {"lighting_score": 5, "has_cctv": False, "has_cover": False}

    crowd_data = get_crowd_levels(station_id)
    gate_crowd = next((g["level"] for g in crowd_data if g["gate"] == gate_number), 1)

    weather = await get_weather_for_station(station_id)

    base = MODE_BASE_SCORE.get(mode, 5)
    time_mod = _time_modifier(now.hour)
    lighting_mod = (gate["lighting_score"] - 5) / 5
    crowd_mod = gate_crowd * 0.5 if mode == "walk" else 0.0
    cctv_mod = 0.5 if gate["has_cctv"] else 0.0
    weather_mod = -1.0 if weather.is_rainy and mode in ("walk", "auto") else 0.0

    raw = base + time_mod + lighting_mod + crowd_mod + cctv_mod + weather_mod
    final = max(1.0, min(10.0, raw))

    factors = [
        SafetyFactor(
            label="Well-lit" if gate["lighting_score"] >= 7 else "Dim area",
            score=gate["lighting_score"],
            tone="good" if gate["lighting_score"] >= 7 else ("ok" if gate["lighting_score"] >= 4 else "bad"),
            icon="eye",
        ),
        SafetyFactor(
            label="Crowded" if gate_crowd >= 2 else "Low foot traffic",
            score=float(gate_crowd),
            tone="good" if gate_crowd >= 2 else "ok",
            icon="crowd",
        ),
        SafetyFactor(
            label="Walking safe" if mode != "walk" or final >= 6 else "Walking unsafe",
            score=final if mode == "walk" else 8.0,
            tone=_tone(final) if mode == "walk" else "good",
            icon="walk",
        ),
        SafetyFactor(
            label="Verified driver" if mode == "cab" else f"{mode.capitalize()} mode",
            score=8.0 if mode == "cab" else 6.0,
            tone="good" if mode == "cab" else "ok",
            icon="shield",
        ),
    ]

    return SafetyScoreResponse(
        overall_score=round(final, 1),
        tone=_tone(final),
        factors=factors,
    )
