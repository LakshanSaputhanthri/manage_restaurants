import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStaff } from '../context/StaffContext'
import type { StaffRole } from '../api/types'

export default function RequireRole({ role, children }: { role: StaffRole; children: ReactNode }) {
  const { user, loading } = useStaff()

  if (loading) return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>
  if (!user) return <Navigate to="/staff/login" replace />
  if (user.role !== role) return <Navigate to="/staff/login" replace />

  return <>{children}</>
}
