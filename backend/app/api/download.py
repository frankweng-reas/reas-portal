from __future__ import annotations

import re
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.core.activation import verify_code
from app.core.config import settings

router = APIRouter(prefix="/download", tags=["download"])

_SAFE_FILENAME = re.compile(r"^[\w\.\-]+\.tar\.gz$")


def _release_dir() -> Path:
    return Path(settings.RELEASE_DIR)


def _list_releases() -> list[dict]:
    d = _release_dir()
    if not d.exists():
        return []
    releases = []
    for f in sorted(d.glob("*.tar.gz"), reverse=True):
        stat = f.stat()
        releases.append({
            "filename": f.name,
            "size_bytes": stat.st_size,
            "size_mb": round(stat.st_size / 1024 / 1024, 1),
        })
    return releases


class VerifyRequest(BaseModel):
    code: str


class ReleaseItem(BaseModel):
    filename: str
    size_bytes: int
    size_mb: float


class VerifyResponse(BaseModel):
    customer: str
    agents: list[str]
    expires: str | None
    releases: list[ReleaseItem]


@router.post("/verify", response_model=VerifyResponse)
def verify(req: VerifyRequest) -> VerifyResponse:
    payload = verify_code(req.code)
    releases = _list_releases()
    return VerifyResponse(
        customer=payload.get("customer", ""),
        agents=payload.get("agents", []),
        expires=payload.get("expires"),
        releases=[ReleaseItem(**r) for r in releases],
    )


@router.get("/file/{filename}")
def download_file(
    filename: str,
    code: str = Query(..., description="Activation Code"),
) -> FileResponse:
    if not _SAFE_FILENAME.match(filename):
        raise HTTPException(status_code=400, detail="檔名不合法")

    verify_code(code)

    file_path = _release_dir() / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="檔案不存在")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/gzip",
    )
