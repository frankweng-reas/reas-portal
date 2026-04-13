"""授權碼產生邏輯，格式與 NeuroSme activation service 完全一致。

Code 格式：{base64url(json_payload, no padding)}.{hmac_sha256[:32]}
"""
import base64
import hashlib
import hmac
import json
import secrets
from datetime import date

from fastapi import HTTPException

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


def verify_code(code: str) -> dict:
    """驗證授權碼簽章與到期日，回傳 payload dict；驗證失敗則 raise HTTPException。"""
    parts = code.strip().split(".")
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Code 格式錯誤")

    payload_b64, sig = parts
    expected_sig = _sign(payload_b64)
    if not hmac.compare_digest(sig, expected_sig):
        raise HTTPException(status_code=400, detail="Code 無效或已被竄改")

    padding = (4 - len(payload_b64) % 4) % 4
    try:
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "=" * padding).decode())
    except Exception:
        raise HTTPException(status_code=400, detail="Code 格式錯誤")

    if payload.get("expires"):
        if date.fromisoformat(payload["expires"]) < date.today():
            raise HTTPException(status_code=400, detail="Code 已到期")

    return payload
