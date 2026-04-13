from datetime import date, datetime

from sqlalchemy import Date, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class IssuedCode(Base):
    """REAS 視角的授權發放記錄（與客戶端 ActivationCode 完全獨立）"""

    __tablename__ = "issued_codes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    agent_ids: Mapped[str] = mapped_column(Text, nullable=False)  # comma-separated
    expires_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    code_token: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
