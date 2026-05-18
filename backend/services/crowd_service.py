from datetime import datetime, timezone

from db import get_supabase
from utils.cache import crowd_cache


def get_crowd_levels(station_id: str) -> list[dict]:
    cache_key = f"{station_id}"
    cached = crowd_cache.get(cache_key)
    if cached:
        return cached

    now = datetime.now(timezone.utc)
    day_of_week = now.weekday()
    hour = now.hour

    # Python weekday: 0=Monday. DB: 0=Sunday. Convert.
    db_dow = (day_of_week + 1) % 7

    sb = get_supabase()
    result = (
        sb.table("crowd_patterns")
        .select("gate_number, avg_crowd_level")
        .eq("station_id", station_id)
        .eq("day_of_week", db_dow)
        .eq("hour", hour)
        .order("gate_number")
        .execute()
    )

    if not result.data:
        gates = [{"gate": g, "level": 1} for g in range(1, 5)]
    else:
        gates = [
            {"gate": row["gate_number"], "level": min(3, round(row["avg_crowd_level"]))}
            for row in result.data
        ]

    crowd_cache[cache_key] = gates
    return gates
