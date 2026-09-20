import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchStaffMe, staffLogin } from '../api/auth'
import { staffTokenStore } from '../api/client'
import type { StaffUser } from '../api/types'

interface StaffContextValue {
  user: StaffUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<StaffUser>
  logout: () => void
}

const StaffContext = createContext<StaffContextValue | undefined>(undefined)

export function StaffProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!staffTokenStore.getAccess()) {
      setLoading(false)
      return
    }
    fetchStaffMe()
      .then(setUser)
      .catch(() => staffTokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const result = await staffLogin(username, password)
    staffTokenStore.set(result.access, result.refresh)
    setUser(result.user)
    return result.user
  }

  const logout = () => {
    staffTokenStore.clear()
    setUser(null)
  }

  return <StaffContext.Provider value={{ user, loading, login, logout }}>{children}</StaffContext.Provider>
}

export function useStaff() {
  const ctx = useContext(StaffContext)
  if (!ctx) throw new Error('useStaff must be used within StaffProvider')
  return ctx
}
