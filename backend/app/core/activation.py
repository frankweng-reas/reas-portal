"""授權碼產生邏輯，格式與 NeuroSme activation service 完全一致。

Code 格式：{base64url(json_payload, no padding)}.{hmac_sha256[:32]}
"""
import base64
import hashlib
import hmac
import json
import secrets
from datetime import date

from app.core.config import settings


def _sign(payload_b64: str) -> str:
    sig = hmac.new(
        settings.ACTIVATION_SECRET.encode(),
        payload_b64.encode(),
        hashlib.sha256,
    ).hexdigest()
    return sig[:32]


def generate_code(
    customer: str,
    agents: list[str],
    expires: date | None = None,
) -> str:
    payload = {
        "customer": customer,
        "agents": agents,
        "expires": expires.isoformat() if expires else None,
        "nonce": secrets.token_hex(8),
    }
    payload_json = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode().rstrip("=")
    signature = _sign(payload_b64)
    return f"{payload_b64}.{signature}"
