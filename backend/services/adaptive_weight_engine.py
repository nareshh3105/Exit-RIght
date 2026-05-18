from datetime import datetime, timezone
from models.weather import WeatherData


class Weights:
    def __init__(self, time: float, cost: float, safety: float, comfort: float, crowd: float):
        self.time = time
        self.cost = cost
        self.safety = safety
        self.comfort = comfort
        self.crowd = crowd

    def to_dict(self) -> dict:
        return {
            "time": round(self.time, 3),
            "cost": round(self.cost, 3),
            "safety": round(self.safety, 3),
            "comfort": round(self.comfort, 3),
            "crowd": round(self.crowd, 3),
        }


PROFILES = {
    "default":       Weights(0.30, 0.25, 0.20, 0.15, 0.10),
    "morning_rush":  Weights(0.40, 0.20, 0.15, 0.15, 0.10),
    "midday":        Weights(0.25, 0.30, 0.15, 0.20, 0.10),
    "evening_rush":  Weights(0.35, 0.20, 0.20, 0.15, 0.10),
    "night":         Weights(0.15, 0.10, 0.45, 0.15, 0.15),
    "late_night":    Weights(0.10, 0.10, 0.50, 0.15, 0.15),
}


def _get_time_profile(hour: int, is_weekday: bool) -> str:
    if not is_weekday:
        if 21 <= hour or hour < 5:
            return "night"
        return "default"

    if 7 <= hour < 10:
        return "morning_rush"
    if 10 <= hour < 17:
        return "midday"
    if 17 <= hour < 20:
        return "evening_rush"
    if 20 <= hour < 22:
        return "night"
    return "late_night"


def get_adaptive_weights(
    weather: WeatherData | None = None,
    user_prefs: dict | None = None,
) -> Weights:
    now = datetime.now(timezone.utc)
    is_weekday = now.weekday() < 5
    profile_name = _get_time_profile(now.hour, is_weekday)
    base = PROFILES[profile_name]

    w = Weights(base.time, base.cost, base.safety, base.comfort, base.crowd)

    if weather and weather.is_rainy:
        w.safety += 0.10
        w.comfort += 0.05
        total = w.time + w.cost + w.safety + w.comfort + w.crowd
        w.time /= total
        w.cost /= total
        w.safety /= total
        w.comfort /= total
        w.crowd /= total

    if user_prefs:
        cost_sens = user_prefs.get("cost_sensitivity", 0.5)
        if cost_sens > 0.7:
            shift = 0.10
            w.cost += shift
            w.time -= shift / 4
            w.safety -= shift / 4
            w.comfort -= shift / 4
            w.crowd -= shift / 4

        safety_sens = user_prefs.get("safety_sensitivity", 0.5)
        if safety_sens > 0.7:
            shift = 0.10
            w.safety += shift
            w.time -= shift / 4
            w.cost -= shift / 4
            w.comfort -= shift / 4
            w.crowd -= shift / 4

    return w
