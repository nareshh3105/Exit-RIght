import httpx
from datetime import datetime, timezone

from config import get_settings
from db import get_supabase
from models.weather import WeatherData
from utils.cache import weather_cache


async def get_weather_for_station(station_id: str) -> WeatherData:
    cached = weather_cache.get(station_id)
    if cached:
        return cached

    sb = get_supabase()

    db_cache = (
        sb.table("weather_cache")
        .select("*")
        .eq("station_id", station_id)
        .gte("expires_at", datetime.now(timezone.utc).isoformat())
        .order("fetched_at", desc=True)
        .limit(1)
        .execute()
    )
    if db_cache.data:
        row = db_cache.data[0]
        wd = WeatherData(
            condition=row["condition"],
            temp_celsius=row["temp_celsius"],
            humidity=row["humidity"],
            wind_kph=row["wind_kph"],
            rain_probability=row["rain_probability"],
            rain_mm_next_hour=row["rain_mm_next_hour"],
            fetched_at=row["fetched_at"],
        )
        weather_cache[station_id] = wd
        return wd

    station = sb.table("stations").select("lat, lng").eq("id", station_id).single().execute()
    if not station.data:
        return WeatherData()

    lat, lng = station.data["lat"], station.data["lng"]
    settings = get_settings()

    if not settings.openweather_api_key:
        return WeatherData()

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lng,
                    "appid": settings.openweather_api_key,
                    "units": "metric",
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        return WeatherData()

    main = data.get("weather", [{}])[0].get("main", "Clear").lower()
    condition_map = {
        "thunderstorm": "thunderstorm",
        "drizzle": "drizzle",
        "rain": "rain",
        "snow": "snow",
        "clouds": "cloudy",
        "clear": "clear",
    }
    condition = condition_map.get(main, "clear")
    rain_1h = data.get("rain", {}).get("1h", 0.0)

    wd = WeatherData(
        condition=condition,
        temp_celsius=data.get("main", {}).get("temp", 30.0),
        humidity=data.get("main", {}).get("humidity", 60),
        wind_kph=data.get("wind", {}).get("speed", 0) * 3.6,
        rain_probability=min(100, int(rain_1h * 50)) if rain_1h > 0 else (70 if condition in ("rain", "drizzle", "thunderstorm") else 10),
        rain_mm_next_hour=rain_1h,
        fetched_at=datetime.now(timezone.utc).isoformat(),
    )

    sb.table("weather_cache").insert({
        "station_id": station_id,
        "condition": wd.condition,
        "temp_celsius": wd.temp_celsius,
        "humidity": wd.humidity,
        "wind_kph": wd.wind_kph,
        "rain_probability": wd.rain_probability,
        "rain_mm_next_hour": wd.rain_mm_next_hour,
    }).execute()

    weather_cache[station_id] = wd
    return wd
