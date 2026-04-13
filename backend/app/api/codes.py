from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import require_api_key
from app.core.activation import generate_code
from app.core.database import get_db
from app.models.issued_code import IssuedCode

router = APIRouter(prefix="/codes", tags=["codes"])


class GenerateRequest(BaseModel):
    customer_name: str
    agent_ids: list[str]
    expires_at: date | None = None
    note: str | None = None


class CodeResponse(BaseModel):
    id: int
    customer_name: str
    agent_ids: list[str]
    expires_at: date | None
    code_token: str
    created_at: str
    note: str | None


def _to_response(r: IssuedCode) -> CodeResponse:
    return CodeResponse(
        id=r.id,
        customer_name=r.customer_name,
        agent_ids=r.agent_ids.split(",") if r.agent_ids else [],
        expires_at=r.expires_at,
        code_token=r.code_token,
        created_at=r.created_at.isoformat(),
        note=r.note,
    )


@router.post("", response_model=CodeResponse)
def create_code(
    req: GenerateRequest,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[str, Depends(require_api_key)],
) -> CodeResponse:
    token = generate_code(req.customer_name, req.agent_ids, req.expires_at)
    record = IssuedCode(
        customer_name=req.customer_name,
        agent_ids=",".join(req.agent_ids),
        expires_at=req.expires_at,
        code_token=token,
        note=req.note,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_response(record)


@router.get("", response_model=list[CodeResponse])
def list_codes(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[str, Depends(require_api_key)],
) -> list[CodeResponse]:
    records = db.query(IssuedCode).order_by(IssuedCode.created_at.desc()).all()
    return [_to_response(r) for r in records]
