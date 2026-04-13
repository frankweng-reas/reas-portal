import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://reasportal:secret@localhost:5432/reasportal"
    PORTAL_API_KEY: str = "change-me-in-production"
    ACTIVATION_SECRET: str = "change-me-in-production"
    CORS_ORIGINS: str = '["http://localhost:5174"]'

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
