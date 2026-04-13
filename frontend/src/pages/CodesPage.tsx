import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, Plus, Copy, Check, RefreshCw } from 'lucide-react'
import { listCodes, createCode, type CodeRecord } from '../api/codes'
import { AGENT_OPTIONS } from '../api/agents'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-TW', { timeZoneName: 'short' })
}

export default function CodesPage() {
  const [history, setHistory] = useState<CodeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // form state
  const [customer, setCustomer] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [expires, setExpires] = useState('')
  const [note, setNote] = useState('')
  const [generatedToken, setGeneratedToken] = useState('')
  const [error, setError] = useState('')

  const fetchHistory = useCallback(async () => {
    try {
      const data = await listCodes()
      setHistory(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchHistory() }, [fetchHistory])

  function toggleAgent(id: string) {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id],
    )
  }

  function applyHistory(item: CodeRecord) {
    setCustomer(item.customer_name)
    setSelectedAgents(item.agent_ids)
    setExpires(item.expires_at ?? '')
    setNote(item.note ?? '')
    setGeneratedToken('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!customer.trim()) { setError('請填寫客戶名稱'); return }
    if (selectedAgents.length === 0) { setError('請至少選擇一個 Agent'); return }

    setSubmitting(true)
    try {
      const record = await createCode({
        customer_name: customer.trim(),
        agent_ids: selectedAgents,
        expires_at: expires || null,
        note: note.trim() || null,
      })
      setGeneratedToken(record.code_token)
      setHistory(prev => [record, ...prev])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyToken(token: string, id: number) {
    await navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">授權碼管理</h1>
        <button
          type="button"
          onClick={() => { setLoading(true); void fetchHistory() }}
          className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </button>
      </div>

      {/* Generate Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800">
          <Plus className="h-4 w-4" />
          產生授權碼
        </h2>
        <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">客戶名稱 *</label>
            <input
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 台灣製造股份有限公司"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">授權 Agents *</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AGENT_OPTIONS.map(a => (
                <label
                  key={a.agent_id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-blue-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAgents.includes(a.agent_id)}
                    onChange={() => toggleAgent(a.agent_id)}
                    className="rounded"
                  />
                  <span className="text-gray-700">{a.agent_name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">到期日（選填）</label>
              <input
                type="date"
                value={expires}
                onChange={e => setExpires(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">備註（選填）</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：v2.1 升級授權"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? '產生中...' : '產生授權碼'}
          </button>

          {generatedToken && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="mb-1 text-xs font-medium text-green-700">✓ 授權碼已產生，請複製後交給客戶：</p>
              <div className="flex items-start gap-2">
                <code className="flex-1 break-all text-xs text-green-800">{generatedToken}</code>
                <button
                  type="button"
                  onClick={() => { void copyToken(generatedToken, -1) }}
                  className="shrink-0 text-green-700 hover:text-green-900"
                >
                  {copiedId === -1 ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* History */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">歷史記錄</h3>
          <span className="text-xs text-gray-400">（點「套用」可自動填入上方欄位）</span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">載入中...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400">尚無記錄</p>
        ) : (
          <div className="space-y-2">
            {history.map(item => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{item.customer_name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.agent_ids.map(id => (
                        <span key={id} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          {id}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(item.created_at)}
                      {item.expires_at && <> · 到期 {item.expires_at}</>}
                      {item.note && <> · {item.note}</>}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => { void copyToken(item.code_token, item.id) }}
                      title="複製授權碼"
                      className="flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      複製
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHistory(item)}
                      className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
                    >
                      套用
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
