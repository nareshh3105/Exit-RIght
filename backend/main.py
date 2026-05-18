from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routes import recommend, stations, cabs, weather, crowd, safety, feedback, user_preferences


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Exit Right API",
    version="1.0.0",
    description="Smart metro commuting assistant — Chennai Metro last-mile planner",
    lifespan=lifespan,
)

settings = get_settings()
origins = [o.strip() for o in settings.cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend.router, prefix="/api/v1", tags=["Recommendations"])
app.include_router(stations.router, prefix="/api/v1", tags=["Stations"])
app.include_router(cabs.router, prefix="/api/v1", tags=["Cabs"])
app.include_router(weather.router, prefix="/api/v1", tags=["Weather"])
app.include_router(crowd.router, prefix="/api/v1", tags=["Crowd"])
app.include_router(safety.router, prefix="/api/v1", tags=["Safety"])
app.include_router(feedback.router, prefix="/api/v1", tags=["Feedback"])
app.include_router(user_preferences.router, prefix="/api/v1", tags=["Preferences"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "exit-right-api"}
