import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createGuestSession, fetchCustomerMe } from '../api/auth'
import { customerTokenStore } from '../api/client'
import type { Customer } from '../api/types'

interface CustomerContextValue {
  customer: Customer | null
  loading: boolean
  startGuestSession: (name: string, phone: string, email?: string) => Promise<Customer>
  setCustomer: (customer: Customer) => void
  logout: () => void
}

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomerState] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = customerTokenStore.get()
    if (!token) {
      setLoading(false)
      return
    }
    fetchCustomerMe()
      .then(setCustomerState)
      .catch(() => customerTokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const setCustomer = (value: Customer) => {
    customerTokenStore.set(value.access_token)
    setCustomerState(value)
  }

  const startGuestSession = async (name: string, phone: string, email?: string) => {
    const session = await createGuestSession(name, phone, email)
    setCustomer(session)
    return session
  }

  const logout = () => {
    customerTokenStore.clear()
    setCustomerState(null)
  }

  return (
    <CustomerContext.Provider value={{ customer, loading, startGuestSession, setCustomer, logout }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider')
  return ctx
}
