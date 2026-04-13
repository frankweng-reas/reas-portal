export interface AgentOption {
  agent_id: string
  agent_name: string
  group_name: string
}

export const AGENT_OPTIONS: AgentOption[] = [
  { agent_id: 'chat', agent_name: 'Chat Agent', group_name: '生產管理' },
  { agent_id: 'order', agent_name: 'Order Agent', group_name: '生產管理' },
  { agent_id: 'quotation', agent_name: 'Quotation Agent', group_name: '銷售管理' },
  { agent_id: 'business', agent_name: 'Business Insight Agent', group_name: '銷售管理' },
  { agent_id: 'customer', agent_name: 'Customer Insight Agent', group_name: '銷售管理' },
  { agent_id: 'test01', agent_name: 'Test01 Agent', group_name: '銷售管理' },
  { agent_id: 'interview', agent_name: 'Interview Agent', group_name: '人資管理' },
  { agent_id: 'scheduling', agent_name: 'Scheduling Agent', group_name: '人資管理' },
  { agent_id: 'workorder', agent_name: 'Work Order Agent', group_name: '研發管理' },
  { agent_id: 'invoice', agent_name: 'Invoice Agent', group_name: '財務管理' },
]
