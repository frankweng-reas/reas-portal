import { apiFetch } from './client'

export interface AgentOption {
  agent_id: string
  agent_name: string
  group_id: string
  group_name: string
}

export function listAgents(): Promise<AgentOption[]> {
  return apiFetch<AgentOption[]>('/agents')
}
