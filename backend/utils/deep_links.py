def build_deep_link(template: str, pickup_lat: float, pickup_lng: float, drop_lat: float, drop_lng: float) -> str:
    return (
        template
        .replace("{{pickup_lat}}", str(pickup_lat))
        .replace("{{pickup_lng}}", str(pickup_lng))
        .replace("{{drop_lat}}", str(drop_lat))
        .replace("{{drop_lng}}", str(drop_lng))
    )
