"""reas-portal 可授權的 agent 清單。

這是 reas-portal 的 source of truth，與 NeuroSme 的 agent_catalog_defs.py 獨立維護。
新增 agent 時需同步更新 NeuroSme/backend/app/core/agent_catalog_defs.py。
"""
from typing import TypedDict


class AgentDef(TypedDict):
    agent_id: str
    agent_name: str
    group_id: str
    group_name: str


AGENT_DEFS: list[AgentDef] = [
    {"agent_id": "chat",       "agent_name": "Chat Agent",             "group_id": "production", "group_name": "生產力"},
    {"agent_id": "writing",    "agent_name": "Writing Agent",          "group_id": "production", "group_name": "生產力"},
    {"agent_id": "knowledge",  "agent_name": "Knowledge Agent",        "group_id": "knowledge",  "group_name": "知識管理"},
    {"agent_id": "cs",         "agent_name": "Chat Service Agent",     "group_id": "knowledge",  "group_name": "知識管理"},
#    {"agent_id": "order",      "agent_name": "Order Agent",            "group_id": "production", "group_name": "生產管理"},
#    {"agent_id": "quotation",  "agent_name": "Quotation Agent",        "group_id": "sales",      "group_name": "銷售管理"},
    {"agent_id": "business",   "agent_name": "Business Insight Agent", "group_id": "sales",      "group_name": "分析"},
#    {"agent_id": "customer",   "agent_name": "Customer Insight Agent", "group_id": "sales",      "group_name": "銷售管理"},
#    {"agent_id": "test01",     "agent_name": "Test01 Agent",           "group_id": "sales",      "group_name": "銷售管理"},
#    {"agent_id": "interview",  "agent_name": "Interview Agent",        "group_id": "hr",         "group_name": "人資管理"},
#    {"agent_id": "scheduling", "agent_name": "Scheduling Agent",       "group_id": "hr",         "group_name": "人資管理"},
#    {"agent_id": "workorder",  "agent_name": "Work Order Agent",       "group_id": "rd",         "group_name": "研發管理"},
#    {"agent_id": "invoice",    "agent_name": "Invoice Agent",          "group_id": "financial",  "group_name": "財務管理"},
]
