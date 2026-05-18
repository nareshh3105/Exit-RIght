import uuid
from datetime import datetime, timezone

from db import get_supabase
from models.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    GateRecommendation,
    GateScore,
    TransportOption,
    WeatherAlertResponse,
)
from services.exit_direction_service import rank_gates
from services.weather_service import get_weather_for_station
from services.crowd_service import get_crowd_levels
from services.safety_service import get_safety_score, MODE_COMFORT
from services.adaptive_weight_engine import get_adaptive_weights
from services.google_maps_service import get_directions
from utils.geo import haversine_km

MODES = ["cab", "auto", "bus", "walk"]
MODE_NAMES = {"cab": "Cab", "auto": "Shared Auto", "bus": "Bus", "walk": "Walk"}
WALK_RAIN_PENALTY = 0.3


async def generate_recommendation(req: RecommendationRequest) -> RecommendationResponse:
    sb = get_supabase()

    station = sb.table("stations").select("*").eq("id", req.from_station_id).single().execute()
    if not station.data:
        raise ValueError("Station not found")

    dest_lat = req.to_lat_lng.lat if req.to_lat_lng else 13.0
    dest_lng = req.to_lat_lng.lng if req.to_lat_lng else 80.2

    weather = await get_weather_for_station(req.from_station_id)
    ranked_gates = rank_gates(req.from_station_id, dest_lat, dest_lng, is_rainy=weather.is_rainy)

    if not ranked_gates:
        raise ValueError("No exit gates found for station")

    best_gate = ranked_gates[0]
    gate_data = best_gate["gate_data"]
    distance_km = haversine_km(gate_data.lat, gate_data.lng, dest_lat, dest_lng)

    user_prefs = None
    if req.user_id:
        prefs_result = (
            sb.table("user_preferences")
            .select("*")
            .eq("user_id", req.user_id)
            .maybe_single()
            .execute()
        )
        if prefs_result.data:
            user_prefs = prefs_result.data

    weights = get_adaptive_weights(weather=weather, user_prefs=user_prefs)

    transport_options: list[TransportOption] = []
    for mode in MODES:
        gm_mode = "walking" if mode == "walk" else ("transit" if mode == "bus" else "driving")
        directions = await get_directions(gate_data.lat, gate_data.lng, dest_lat, dest_lng, gm_mode)

        if mode == "walk":
            cost = 0
        elif mode == "bus":
            cost = min(30, max(10, round(distance_km * 5)))
        elif mode == "auto":
            cost = round(25 + distance_km * 15)
        else:
            cost = round(40 + distance_km * 14 + directions["duration_minutes"] * 1.5)

        safety = await get_safety_score(
            req.from_station_id, best_gate["gate_number"], mode, dest_lat, dest_lng
        )

        crowd_data = get_crowd_levels(req.from_station_id)
        gate_crowd = next(
            (g["level"] for g in crowd_data if g["gate"] == best_gate["gate_number"]), 1
        )

        transport_options.append(TransportOption(
            mode=mode,
            name=MODE_NAMES[mode],
            eta=f"{directions['duration_minutes']}min",
            cost=f"₹{cost}" if cost > 0 else "Free",
            crowd_level=gate_crowd,
            safety_score=round(safety.overall_score),
            confidence_percent=0,
            distance_km=round(directions["distance_km"], 1),
            provider_route="/cabs" if mode == "cab" else None,
        ))

    _score_and_rank(transport_options, weights, weather)

    gate_rec = GateRecommendation(
        recommended_gate=best_gate["gate_number"],
        reasons=best_gate["reasons"],
        alternate_gates=[
            GateScore(
                gate=g["gate_number"],
                is_recommended=g["is_recommended"],
                extra_time=g["extra_time"],
                status=g["status"],
                reason=g["reason"],
            )
            for g in ranked_gates[1:]
        ],
    )

    weather_alert = None
    if weather.is_rainy:
        weather_alert = WeatherAlertResponse(
            type="rain",
            message=f"Rain expected — {weather.rain_probability}% chance in the next hour",
            minutes_away=15 if weather.rain_mm_next_hour > 0 else None,
        )
    elif weather.temp_celsius > 38:
        weather_alert = WeatherAlertResponse(
            type="heat",
            message=f"Extreme heat — {weather.temp_celsius}°C. Stay hydrated.",
        )

    ai_take = _generate_ai_take(transport_options, weather)

    rec_id = str(uuid.uuid4())
    if req.user_id:
        sb.table("recommendation_history").insert({
            "id": rec_id,
            "user_id": req.user_id,
            "station_id": req.from_station_id,
            "destination": req.to_destination,
            "destination_lat": dest_lat,
            "destination_lng": dest_lng,
            "recommended_gate": best_gate["gate_number"],
            "recommended_mode": transport_options[0].mode if transport_options else "cab",
            "weather_condition": weather.condition,
            "crowd_level": best_gate["crowd_level"],
            "weights_used": weights.to_dict(),
            "score_breakdown": {opt.mode: opt.confidence_percent for opt in transport_options},
        }).execute()

    return RecommendationResponse(
        id=rec_id,
        from_station_id=req.from_station_id,
        from_station_name=station.data["name"],
        to_destination=req.to_destination,
        to_address=req.to_destination,
        distance_km=round(distance_km, 1),
        gate_recommendation=gate_rec,
        transport_options=transport_options,
        weather_alert=weather_alert,
        ai_take=ai_take,
    )


def _score_and_rank(options: list[TransportOption], weights, weather) -> None:
    if not options:
        return

    max_eta = max(int(o.eta.replace("min", "")) for o in options) or 1
    costs = []
    for o in options:
        c = o.cost.replace("₹", "").replace(",", "")
        costs.append(int(c) if c != "Free" else 0)
    max_cost = max(costs) or 1

    scores = []
    for i, o in enumerate(options):
        eta_val = int(o.eta.replace("min", ""))
        cost_val = costs[i]

        time_score = 1 - (eta_val / max_eta)
        cost_score = 1 - (cost_val / max_cost)
        safety_score = o.safety_score / 10
        comfort_score = MODE_COMFORT.get(o.mode, 0.3)
        crowd_score = 1 - (o.crowd_level / 3)

        raw = (
            weights.time * time_score
            + weights.cost * cost_score
            + weights.safety * safety_score
            + weights.comfort * comfort_score
            + weights.crowd * crowd_score
        )

        if weather and weather.is_rainy and o.mode == "walk":
            raw *= WALK_RAIN_PENALTY

        confidence = min(98, max(40, int(raw * 100 + 30)))
        o.confidence_percent = confidence
        scores.append((i, raw))

    scores.sort(key=lambda x: x[1], reverse=True)
    options[scores[0][0]].is_recommended = True

    cheapest_idx = costs.index(min(costs))
    options[cheapest_idx].is_cheapest = True

    now = datetime.now(timezone.utc)
    if 21 <= now.hour or now.hour < 5:
        for o in options:
            if o.safety_score < 4:
                o.should_avoid = True


def _generate_ai_take(options: list[TransportOption], weather) -> str:
    recommended = next((o for o in options if o.is_recommended), options[0] if options else None)
    cheapest = next((o for o in options if o.is_cheapest), None)

    if not recommended:
        return "No transport options available."

    parts = [f"{recommended.name} wins on time"]

    if weather and weather.is_rainy:
        parts.append("+ safety in rain")

    if cheapest and cheapest.mode != recommended.mode:
        rec_cost = recommended.cost.replace("₹", "").replace(",", "")
        cheap_cost = cheapest.cost.replace("₹", "").replace(",", "")
        if rec_cost != "Free" and cheap_cost != "Free":
            savings = int(rec_cost) - int(cheap_cost)
            if savings > 0:
                parts.append(f"Save ₹{savings} with {cheapest.name}")

    avoid = [o for o in options if o.should_avoid]
    if avoid:
        parts.append(f"Avoid {avoid[0].name.lower()} at night")

    return ". ".join(parts) + "."
