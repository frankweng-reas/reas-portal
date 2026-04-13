import hashlib
import hmac
import json
import os
import base64
from datetime import date

from app.core.config import settings


def _sign(payload: dict) -> str:
    payload_b64 = base64.urlsafe_b64encode(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode()
    ).decode()
    sig = hmac.new(
        settings.ACTIVATION_SECRET.encode(), payload_b64.encode(), hashlib.sha256
    ).hexdigest()
    return f"{payload_b64}.{sig}"


def generate_code(
    customer: str,
    agents: list[str],
    expires: date | None = None,
) -> str:
    nonce = os.urandom(8).hex()
    payload: dict = {
        "customer": customer,
        "agents": agents,
        "expires": expires.isoformat() if expires else None,
        "nonce": nonce,
    }
    return _sign(payload)
