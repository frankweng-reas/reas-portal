import { apiFetch } from './client'

export interface LatestLicense {
  agent_ids: string[]
  expires_at: string | null
  issued_at: string
}

export interface Customer {
  id: number
  name: string
  created_at: string
  latest_license: LatestLicense | null
}

export function listCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/customers')
}

export function createCustomer(name: string): Promise<Customer> {
  return apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function getCustomer(id: number): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`)
}
