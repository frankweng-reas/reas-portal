import { apiFetch } from './client'

export interface CodeRecord {
  id: number
  customer_id: number
  customer_name: string
  agent_ids: string[]
  expires_at: string | null
  code_token: string
  created_at: string
  note: string | null
}

export interface GenerateRequest {
  customer_id: number
  agent_ids: string[]
  expires_at: string | null
  note: string | null
}

export function listCodes(customer_id?: number): Promise<CodeRecord[]> {
  const qs = customer_id ? `?customer_id=${customer_id}` : ''
  return apiFetch<CodeRecord[]>(`/codes${qs}`)
}

export function createCode(req: GenerateRequest): Promise<CodeRecord> {
  return apiFetch<CodeRecord>('/codes', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}
