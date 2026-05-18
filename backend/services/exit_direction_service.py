from db import get_supabase
from models.station import ExitGate
from utils.geo import haversine_km
from services.crowd_service import get_crowd_levels


def get_gates_for_station(station_id: str) -> list[ExitGate]:
    sb = get_supabase()
    result = (
        sb.table("exit_gates")
        .select("*")
        .eq("station_id", station_id)
        .order("gate_number")
        .execute()
    )
    return [
        ExitGate(
            id=r["id"],
            station_id=r["station_id"],
            gate_number=r["gate_number"],
            label=r["label"],
            lat=r["lat"],
            lng=r["lng"],
            has_cover=r["has_cover"],
            has_cctv=r["has_cctv"],
            lighting_score=r["lighting_score"],
            accessibility=r["accessibility"],
        )
        for r in result.data
    ]


def rank_gates(
    station_id: str,
    dest_lat: float,
    dest_lng: float,
    is_rainy: bool = False,
) -> list[dict]:
    gates = get_gates_for_station(station_id)
    if not gates:
        return []

    crowd_data = get_crowd_levels(station_id)
    crowd_map = {g["gate"]: g["level"] for g in crowd_data}

    scored = []
    for gate in gates:
        dist = haversine_km(gate.lat, gate.lng, dest_lat, dest_lng)

        dist_score = 1.0 / (1.0 + dist)
        crowd_penalty = crowd_map.get(gate.gate_number, 1) * 0.1
        lighting_bonus = gate.lighting_score / 20
        cover_bonus = 0.15 if gate.has_cover and is_rainy else 0.0

        total = dist_score - crowd_penalty + lighting_bonus + cover_bonus

        scored.append({
            "gate": gate,
            "distance_km": round(dist, 2),
            "crowd_level": crowd_map.get(gate.gate_number, 1),
            "score": total,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    best_dist = scored[0]["distance_km"]
    result = []
    for i, s in enumerate(scored):
        extra_km = s["distance_km"] - best_dist
        extra_min = max(0, round(extra_km / 0.08))

        reasons = []
        if i == 0:
            reasons.append("Closest to your destination")
            if s["gate"].has_cover:
                reasons.append("Covered walkway")
            if s["gate"].lighting_score >= 7:
                reasons.append("Well-lit exit")
            if s["crowd_level"] <= 1:
                reasons.append("Low crowd")

        status = "good" if i == 0 else ("ok" if extra_min <= 3 else "bad")
        reason = None
        if i > 0:
            if s["crowd_level"] >= 2:
                reason = "Crowded"
            elif extra_min > 0:
                reason = f"+{extra_min}min walk"

        result.append({
            "gate_number": s["gate"].gate_number,
            "is_recommended": i == 0,
            "extra_time": f"+{extra_min}min" if extra_min > 0 else None,
            "status": status,
            "reason": reason,
            "reasons": reasons,
            "distance_km": s["distance_km"],
            "crowd_level": s["crowd_level"],
            "gate_data": s["gate"],
        })

    return result
