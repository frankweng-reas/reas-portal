import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://reasportal:secret@localhost:5432/reasportal"
    PORTAL_API_KEY: str = "change-me-in-production"
    # 固定值，與 NeuroSme docker-compose.onprem.yml 中的 ACTIVATION_SECRET 完全一致
    # 這是 REAS 唯一掌控的簽名金鑰，不對外暴露、不允許客戶端覆寫
    ACTIVATION_SECRET: str = "b00874c6cef87073f86b1ef7b462ca0a65f5b78eda8e451a942b2e16c075b866"
    CORS_ORIGINS: str = '["http://localhost:5174"]'

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
