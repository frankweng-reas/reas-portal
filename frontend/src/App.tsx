import { useState } from 'react'
import './index.css'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import type { Customer } from './api/customers'

export default function App() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <span className="text-lg font-semibold text-gray-900">REAS Portal</span>
      </header>
      <main>
        {selectedCustomer ? (
          <CustomerDetailPage
            customer={selectedCustomer}
            onBack={() => setSelectedCustomer(null)}
          />
        ) : (
          <CustomersPage onSelect={setSelectedCustomer} />
        )}
      </main>
    </div>
  )
}
