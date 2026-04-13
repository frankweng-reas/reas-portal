import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Copy, Check, ClipboardList, Pencil } from 'lucide-react'
import { listCodes, createCode, type CodeRecord } from '../api/codes'
import { listAgents, type AgentOption } from '../api/agents'
import { updateCustomer, type Customer } from '../api/customers'

interface Props {
  customer: Customer
  onBack: () => void
  onUpdate: (updated: Customer) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-TW', { timeZoneName: 'short' })
}

export default function CustomerDetailPage({ customer, onBack, onUpdate }: Props) {
  const [agents, setAgents] = useState<AgentOption[]>([])
  const [history, setHistory] = useState<CodeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [generatedToken, setGeneratedToken] = useState('')
  const [error, setError] = useState('')

  // 編輯客戶名稱
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(customer.name)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')

  // form
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [expires, setExpires] = useState('')
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [agentList, codes] = await Promise.all([
        listAgents(),
        listCodes(customer.id),
      ])
      setAgents(agentList)
      setHistory(codes)
      // 預設勾選最新一筆的 agents
      if (codes.length > 0) {
        setSelectedAgents(codes[0].agent_ids)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [customer.id])

  useEffect(() => { void load() }, [load])

  async function handleSaveName() {
    if (!nameInput.trim() || nameInput.trim() === customer.name) {
      setEditingName(false)
      return
    }
    setSavingName(true)
    setNameError('')
    try {
      const updated = await updateCustomer(customer.id, nameInput.trim())
      onUpdate(updated)
      setEditingName(false)
    } catch (e) {
      setNameError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSavingName(false)
    }
  }

  function toggleAgent(id: string) {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (selectedAgents.length === 0) { setError('請至少選擇一個 Agent'); return }
    setSubmitting(true)
    try {
      const record = await createCode({
        customer_id: customer.id,
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

  // group agents by group_name
  const groups = agents.reduce<Record<string, AgentOption[]>>((acc, a) => {
    if (!acc[a.group_name]) acc[a.group_name] = []
    acc[a.group_name].push(a)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        返回客戶列表
      </button>

      {/* 客戶名稱（可編輯） */}
      <div className="mb-6 flex items-center gap-2">
        {editingName ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') void handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
              className="flex-1 rounded-lg border border-blue-400 px-3 py-1.5 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => { void handleSaveName() }}
              disabled={savingName}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {savingName ? '儲存中...' : '儲存'}
            </button>
            <button
              onClick={() => { setEditingName(false); setNameInput(customer.name) }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <button
              onClick={() => { setEditingName(true); setNameInput(customer.name) }}
              title="修改名稱"
              className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            >
              <Pencil className="h-3.5 w-3.5" />
              修改
            </button>
          </>
        )}
      </div>
      {nameError && <p className="mb-3 text-sm text-red-500">{nameError}</p>}

      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">目前授權 Agents</p>
        {customer.latest_license ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {customer.latest_license.agent_ids.map(id => (
              <span key={id} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {agents.find(a => a.agent_id === id)?.agent_name ?? id}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-gray-400">尚未授權</p>
        )}
      </div>

      {/* 產生新授權碼 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">產生授權碼</h2>
        {loading ? (
          <p className="text-sm text-gray-400">載入中...</p>
        ) : (
          <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">選擇授權 Agents</label>
              <div className="space-y-3">
                {Object.entries(groups).map(([groupName, groupAgents]) => (
                  <div key={groupName}>
                    <p className="mb-1 text-xs font-semibold text-gray-400">{groupName}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {groupAgents.map(a => (
                        <label
                          key={a.agent_id}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                            selectedAgents.includes(a.agent_id)
                              ? 'border-blue-400 bg-blue-50 text-blue-800'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAgents.includes(a.agent_id)}
                            onChange={() => toggleAgent(a.agent_id)}
                            className="rounded"
                          />
                          {a.agent_name}
                        </label>
                      ))}
                    </div>
                  </div>
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
                  placeholder="例如：v2.1 升級"
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
        )}
      </div>

      {/* 歷史記錄 */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">歷史授權記錄</h3>
          </div>
          <div className="space-y-2">
            {history.map(item => (
              <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1">
                      {item.agent_ids.map(id => (
                        <span key={id} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                          {agents.find(a => a.agent_id === id)?.agent_name ?? id}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(item.created_at)}
                      {item.expires_at && <> · 到期 {item.expires_at}</>}
                      {item.note && <> · {item.note}</>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { void copyToken(item.code_token, item.id) }}
                    title="複製授權碼"
                    className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    複製
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
