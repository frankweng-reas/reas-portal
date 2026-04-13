import { useState, useEffect } from 'react'
import { Plus, Users, ChevronRight } from 'lucide-react'
import { listCustomers, createCustomer, type Customer } from '../api/customers'

interface Props {
  onSelect: (customer: Customer) => void
}

export default function CustomersPage({ onSelect }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listCustomers()
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setError('')
    try {
      const c = await createCustomer(newName.trim())
      setCustomers(prev => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setShowForm(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">客戶管理</h1>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          新增客戶
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { void handleAdd(e) }} className="mb-4 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="客戶名稱"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {adding ? '新增中...' : '確認'}
          </button>
        </form>
      )}
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">載入中...</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-gray-400">尚無客戶，點右上角新增</p>
      ) : (
        <div className="space-y-2">
          {customers.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:border-blue-300 hover:bg-blue-50 text-left"
            >
              <div>
                <p className="font-medium text-gray-900">{c.name}</p>
                {c.latest_license ? (
                  <p className="mt-0.5 text-xs text-gray-500">
                    已授權：{c.latest_license.agent_ids.join('、')}
                    {c.latest_license.expires_at && <> · 到期 {c.latest_license.expires_at}</>}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-gray-400">尚未授權</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
