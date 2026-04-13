from fastapi import Header, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader

from app.core.config import settings

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_api_key(x_api_key: str | None = Security(_api_key_header)) -> str:
    if not x_api_key or x_api_key != settings.PORTAL_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return x_api_key
