import { apiFetch } from './client'

export interface CodeRecord {
  id: number
  customer_name: string
  agent_ids: string[]
  expires_at: string | null
  code_token: string
  created_at: string
  note: string | null
}

export interface GenerateRequest {
  customer_name: string
  agent_ids: string[]
  expires_at: string | null
  note: string | null
}

export function listCodes(): Promise<CodeRecord[]> {
  return apiFetch<CodeRecord[]>('/codes')
}

export function createCode(req: GenerateRequest): Promise<CodeRecord> {
  return apiFetch<CodeRecord>('/codes', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}
