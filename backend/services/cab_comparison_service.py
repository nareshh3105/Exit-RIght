from datetime import datetime, timezone

from db import get_supabase
from models.cab import CabProviderResponse
from utils.geo import haversine_km, estimate_drive_minutes
from utils.deep_links import build_deep_link
from utils.cache import cab_price_cache

FARE_FORMULAS = {
    "Uber":        {"base": 40, "per_km": 14.0, "per_min": 1.5, "type": "Go",   "rating": 4.5},
    "Ola":         {"base": 50, "per_km": 13.0, "per_min": 1.5, "type": "Mini", "rating": 4.3},
    "Rapido":      {"base": 35, "per_km": 12.0, "per_min": 1.0, "type": "Cab",  "rating": 4.2},
    "Namma Yatri": {"base": 25, "per_km": 15.0, "per_min": 0.0, "type": "Auto", "rating": 4.6},
}


def _surge_multiplier(hour: int) -> float:
    if 8 <= hour <= 10 or 17 <= hour <= 19:
        return 1.3
    if 22 <= hour or hour < 5:
        return 1.5
    return 1.0


def get_cab_providers(
    pickup_lat: float,
    pickup_lng: float,
    drop_lat: float,
    drop_lng: float,
) -> list[CabProviderResponse]:
    cache_key = f"{pickup_lat:.4f},{pickup_lng:.4f},{drop_lat:.4f},{drop_lng:.4f}"
    cached = cab_price_cache.get(cache_key)
    if cached:
        return cached

    distance_km = haversine_km(pickup_lat, pickup_lng, drop_lat, drop_lng)
    drive_minutes = estimate_drive_minutes(distance_km)
    hour = datetime.now(timezone.utc).hour
    surge = _surge_multiplier(hour)

    sb = get_supabase()
    providers = sb.table("cab_providers").select("*").eq("is_active", True).execute()

    results: list[CabProviderResponse] = []
    for p in providers.data:
        formula = FARE_FORMULAS.get(p["brand"])
        if not formula:
            continue

        raw_fare = formula["base"] + formula["per_km"] * distance_km + formula["per_min"] * drive_minutes
        provider_surge = surge if p["brand"] != "Namma Yatri" else 1.0
        final_fare = round(raw_fare * provider_surge)

        eta = drive_minutes + (3 if p["brand"] in ("Uber", "Ola") else 5)

        deep_link = build_deep_link(p["deep_link_template"], pickup_lat, pickup_lng, drop_lat, drop_lng)
        web_fallback = build_deep_link(p["web_fallback_url"], pickup_lat, pickup_lng, drop_lat, drop_lng)

        results.append(CabProviderResponse(
            id=p["id"],
            brand=p["brand"],
            type=formula["type"],
            monogram=p["monogram"],
            brand_color=p["brand_color"],
            price=final_fare,
            eta_minutes=eta,
            rating=formula["rating"],
            surge_multiplier=round(provider_surge, 1),
            note=p.get("commission_info"),
            badge="Zero commission" if p["brand"] == "Namma Yatri" else None,
            deep_link_url=deep_link,
            web_fallback_url=web_fallback,
        ))

    results.sort(key=lambda x: x.price)

    if results:
        results[0].is_cheapest = True
        best = min(results, key=lambda x: x.price * 0.4 + x.eta_minutes * 0.3 - x.rating * 10)
        best.is_recommended = True

    cab_price_cache[cache_key] = results
    return results
