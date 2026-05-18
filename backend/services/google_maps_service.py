import httpx

from config import get_settings
from utils.geo import haversine_km, estimate_drive_minutes, estimate_walk_minutes


async def get_directions(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    mode: str = "driving",
) -> dict:
    """Get directions from Google Maps Directions API. Falls back to estimation if API key missing."""
    settings = get_settings()
    distance_km = haversine_km(origin_lat, origin_lng, dest_lat, dest_lng)

    if not settings.google_maps_api_key:
        return _estimate_directions(distance_km, mode)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/directions/json",
                params={
                    "origin": f"{origin_lat},{origin_lng}",
                    "destination": f"{dest_lat},{dest_lng}",
                    "mode": mode,
                    "key": settings.google_maps_api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        return _estimate_directions(distance_km, mode)

    if data.get("status") != "OK" or not data.get("routes"):
        return _estimate_directions(distance_km, mode)

    leg = data["routes"][0]["legs"][0]
    return {
        "distance_km": round(leg["distance"]["value"] / 1000, 1),
        "duration_minutes": round(leg["duration"]["value"] / 60),
        "duration_text": leg["duration"]["text"],
    }


def _estimate_directions(distance_km: float, mode: str) -> dict:
    if mode == "walking":
        minutes = estimate_walk_minutes(distance_km)
    elif mode == "transit":
        minutes = max(5, round(distance_km / 0.4))
    else:
        minutes = estimate_drive_minutes(distance_km)

    return {
        "distance_km": round(distance_km, 1),
        "duration_minutes": minutes,
        "duration_text": f"{minutes} min",
    }


async def get_distance_matrix(
    origins: list[tuple[float, float]],
    destination: tuple[float, float],
) -> list[dict]:
    """Batch distances from multiple origins to one destination."""
    settings = get_settings()

    if not settings.google_maps_api_key:
        return [
            _estimate_directions(
                haversine_km(o[0], o[1], destination[0], destination[1]), "driving"
            )
            for o in origins
        ]

    origins_str = "|".join(f"{lat},{lng}" for lat, lng in origins)
    dest_str = f"{destination[0]},{destination[1]}"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/distancematrix/json",
                params={
                    "origins": origins_str,
                    "destinations": dest_str,
                    "mode": "driving",
                    "key": settings.google_maps_api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        return [
            _estimate_directions(
                haversine_km(o[0], o[1], destination[0], destination[1]), "driving"
            )
            for o in origins
        ]

    results = []
    for i, row in enumerate(data.get("rows", [])):
        elem = row.get("elements", [{}])[0]
        if elem.get("status") == "OK":
            results.append({
                "distance_km": round(elem["distance"]["value"] / 1000, 1),
                "duration_minutes": round(elem["duration"]["value"] / 60),
                "duration_text": elem["duration"]["text"],
            })
        else:
            results.append(
                _estimate_directions(
                    haversine_km(origins[i][0], origins[i][1], destination[0], destination[1]),
                    "driving",
                )
            )

    return results
