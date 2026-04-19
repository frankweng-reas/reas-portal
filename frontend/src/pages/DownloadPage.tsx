import { useState } from 'react'
import {
  Download, ShieldCheck, AlertCircle, Package,
  LogOut, Building2, CalendarDays, Cpu, Terminal,
} from 'lucide-react'
import { verifyCode, buildDownloadUrl, type VerifyResponse } from '../api/download'

export default function DownloadPage() {
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<VerifyResponse | null>(null)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setVerifying(true)
    setError('')
    setResult(null)
    try {
      const data = await verifyCode(code.trim())
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '驗證失敗')
    } finally {
      setVerifying(false)
    }
  }

  function handleReset() {
    setResult(null)
    setCode('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Package className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900">NeuroSme</span>
            <span className="ml-2 text-base text-slate-400">On-Prem 安裝包下載</span>
          </div>
        </div>
        {result && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-base text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            重新驗證
          </button>
        )}
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-10">
        {!result ? (
          /* ── 驗證畫面（置中單欄）── */
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">輸入授權碼</h1>
              <p className="mt-1.5 text-base text-slate-500">請貼入 REAS 提供的 Activation Code 以存取下載頁面</p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <form onSubmit={(e) => { void handleVerify(e) }} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-base font-semibold uppercase tracking-wide text-slate-500">
                    Activation Code
                  </label>
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="eyJ..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-base text-slate-800 placeholder-slate-300 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-base text-red-700 ring-1 ring-red-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifying || !code.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {verifying ? '驗證中...' : '驗證並進入下載頁面'}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-base text-slate-400">
              沒有 Activation Code？請聯絡 REAS 技術支援
            </p>
          </div>
        ) : (
          /* ── 下載畫面（左右兩欄）── */
          <div className="w-full max-w-6xl">
            {/* 成功提示橫幅 */}
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 px-5 py-3.5 ring-1 ring-emerald-200">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="text-base font-medium text-emerald-800">授權驗證成功，以下為您的授權資訊與可下載版本</span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

              {/* ── 左欄：授權資訊 ── */}
              <div className="lg:col-span-2 space-y-5">

                {/* 客戶資訊卡 */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-slate-400">
                    <Building2 className="h-4 w-4" />
                    客戶資訊
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-base text-slate-400">公司名稱</p>
                      <p className="mt-0.5 text-base font-semibold text-slate-900">{result.customer}</p>
                    </div>
                    <div>
                      <p className="text-base text-slate-400 flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />授權到期
                      </p>
                      <p className="mt-0.5 text-base font-medium text-slate-700">
                        {result.expires ?? '永久授權'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 授權模組卡 */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-slate-400">
                    <Cpu className="h-4 w-4" />
                    授權模組
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {result.agents.map(a => (
                      <span
                        key={a}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-base font-semibold text-blue-700 ring-1 ring-blue-100"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 安裝說明卡 */}
                <div className="rounded-2xl bg-slate-900 p-6 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-slate-400">
                    <Terminal className="h-4 w-4" />
                    安裝指令
                  </h2>
                  <pre className="overflow-x-auto text-base leading-relaxed text-slate-300">{`tar xzf neurosme-onprem-vX.X.X.tar.gz
cd neurosme-onprem-vX.X.X
bash start.sh`}</pre>
                  <p className="mt-4 text-base text-slate-500">日常重啟（不重新載入映像）：</p>
                  <pre className="mt-1 overflow-x-auto text-base leading-relaxed text-slate-300">{`bash restart.sh`}</pre>
                </div>

                {/* 說明備註 */}
                <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-100">
                  <div className="text-base text-amber-800 space-y-1">
                    <p className="font-semibold">安裝前置條件</p>
                      <p>伺服器需先安裝 Docker（含 Compose Plugin）：</p>
                      <code className="block bg-amber-100 rounded px-2 py-1 font-mono text-base text-amber-900">
                        curl -fsSL https://get.docker.com | sh
                      </code>
                      <p className="pt-1">預設登入：<span className="font-mono">admin@local.dev / Admin1234!</span></p>
                    </div>
                </div>

              </div>

              {/* ── 右欄：下載清單 ── */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 h-full">
                  <h2 className="mb-5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-slate-400">
                      <Download className="h-4 w-4" />
                      可下載版本
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-base font-medium text-slate-600">
                      {result.releases.length} 個版本
                    </span>
                  </h2>

                  {result.releases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Package className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-slate-600">目前尚無可下載的版本</p>
                      <p className="mt-1 text-base text-slate-400">請聯絡 REAS 技術支援</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.releases.map((r, idx) => {
                        const isLatest = idx === 0
                        const versionMatch = r.filename.match(/v[\d.]+/)
                        const version = versionMatch ? versionMatch[0] : r.filename
                        return (
                          <div
                            key={r.filename}
                            className={`group relative flex items-center justify-between rounded-xl border px-5 py-4 transition-all hover:shadow-md ${
                              isLatest
                                ? 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-50'
                                : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                isLatest ? 'bg-blue-600' : 'bg-slate-200'
                              }`}>
                                <Package className={`h-5 w-5 ${isLatest ? 'text-white' : 'text-slate-500'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-base font-semibold text-slate-900">{version}</p>
                                  {isLatest && (
                                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-base font-bold text-white">
                                      最新版
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-base text-slate-500">{r.filename}</p>
                                <p className="mt-0.5 text-base text-slate-400">{r.size_mb} MB</p>
                              </div>
                            </div>

                            <a
                              href={buildDownloadUrl(r.filename, code.trim())}
                              download={r.filename}
                              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-base font-semibold transition-all ${
                                isLatest
                                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <Download className="h-4 w-4" />
                              下載
                            </a>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <p className="mt-6 text-base text-slate-400 text-right">
                    如需舊版或有任何問題，請聯絡 REAS 技術支援
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  )
}
