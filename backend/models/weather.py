from pydantic import BaseModel


class WeatherData(BaseModel):
    condition: str = "clear"
    temp_celsius: float = 30.0
    humidity: int = 60
    wind_kph: float = 10.0
    rain_probability: int = 0
    rain_mm_next_hour: float = 0.0
    fetched_at: str | None = None

    @property
    def is_rainy(self) -> bool:
        return self.rain_probability > 50 or self.condition in ("rain", "drizzle", "thunderstorm")
