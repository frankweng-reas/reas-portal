export interface ReleaseItem {
  filename: string
  size_bytes: number
  size_mb: number
}

export interface VerifyResponse {
  customer: string
  agents: string[]
  expires: string | null
  releases: ReleaseItem[]
}

export async function verifyCode(code: string): Promise<VerifyResponse> {
  const res = await fetch('/api/download/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? '驗證失敗')
  }
  return res.json() as Promise<VerifyResponse>
}

export function buildDownloadUrl(filename: string, code: string): string {
  return `/api/download/file/${encodeURIComponent(filename)}?code=${encodeURIComponent(code)}`
}
