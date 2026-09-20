import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaff } from '../context/StaffContext'

export default function StaffLayout({ title, children }: { title: string; children: ReactNode }) {
  const { user, logout } = useStaff()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{user?.username}</p>
        </div>
        <button
          onClick={() => {
            logout()
            navigate('/staff/login')
          }}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Log out
        </button>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
    </div>
  )
}
