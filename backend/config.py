from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str = ""

    google_maps_api_key: str = ""
    openweather_api_key: str = ""

    cors_origins: str = "http://localhost:3000"
    port: int = 8000

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
