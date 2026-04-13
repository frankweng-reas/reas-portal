from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.agent_defs import AGENT_DEFS
from app.core.auth import require_api_key

router = APIRouter(prefix="/agents", tags=["agents"])


class AgentResponse(BaseModel):
    agent_id: str
    agent_name: str
    group_id: str
    group_name: str


@router.get("", response_model=list[AgentResponse])
def list_agents(
    _: Annotated[str, Depends(require_api_key)],
) -> list[AgentResponse]:
    return [AgentResponse(**a) for a in AGENT_DEFS]
