import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api import codes, agents

app = FastAPI(title="REAS Portal API")

Base.metadata.create_all(bind=engine)

origins = json.loads(settings.CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(codes.router, prefix="/api")
app.include_router(agents.router, prefix="/api")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
