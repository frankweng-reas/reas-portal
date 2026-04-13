from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import require_api_key
from app.core.database import get_db
from app.models.customer import Customer
from app.models.issued_code import IssuedCode

router = APIRouter(prefix="/customers", tags=["customers"])


class CustomerCreate(BaseModel):
    name: str


class LatestLicense(BaseModel):
    agent_ids: list[str]
    expires_at: str | None
    issued_at: str


class CustomerResponse(BaseModel):
    id: int
    name: str
    created_at: str
    latest_license: LatestLicense | None


def _to_response(c: Customer) -> CustomerResponse:
    latest: IssuedCode | None = c.issued_codes[0] if c.issued_codes else None
    return CustomerResponse(
        id=c.id,
        name=c.name,
        created_at=c.created_at.isoformat(),
        latest_license=LatestLicense(
            agent_ids=latest.agent_ids.split(",") if latest and latest.agent_ids else [],
            expires_at=latest.expires_at.isoformat() if latest and latest.expires_at else None,
            issued_at=latest.created_at.isoformat(),
        ) if latest else None,
    )


@router.get("", response_model=list[CustomerResponse])
def list_customers(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[str, Depends(require_api_key)],
) -> list[CustomerResponse]:
    customers = db.query(Customer).order_by(Customer.name).all()
    return [_to_response(c) for c in customers]


@router.post("", response_model=CustomerResponse)
def create_customer(
    req: CustomerCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[str, Depends(require_api_key)],
) -> CustomerResponse:
    if db.query(Customer).filter(Customer.name == req.name).first():
        raise HTTPException(status_code=409, detail="客戶名稱已存在")
    c = Customer(name=req.name)
    db.add(c)
    db.commit()
    db.refresh(c)
    return _to_response(c)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[str, Depends(require_api_key)],
) -> CustomerResponse:
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="客戶不存在")
    return _to_response(c)
