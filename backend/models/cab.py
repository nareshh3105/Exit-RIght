from pydantic import BaseModel


class CabProviderResponse(BaseModel):
    id: str
    brand: str
    type: str
    monogram: str
    brand_color: str
    price: int
    eta_minutes: int
    rating: float
    surge_multiplier: float = 1.0
    is_recommended: bool = False
    is_cheapest: bool = False
    note: str | None = None
    badge: str | None = None
    deep_link_url: str
    web_fallback_url: str
