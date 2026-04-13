const API_KEY = import.meta.env.VITE_PORTAL_API_KEY ?? ''

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

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
