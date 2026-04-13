import './index.css'
import CodesPage from './pages/CodesPage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <span className="text-lg font-semibold text-gray-900">REAS Portal</span>
      </header>
      <main>
        <CodesPage />
      </main>
    </div>
  )
}
