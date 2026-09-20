import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaff } from '../../context/StaffContext'
import type { StaffRole } from '../../api/types'

const ROLE_HOME: Record<StaffRole, string> = {
  super_admin: '/staff/admin',
  owner: '/staff/owner',
  chef: '/staff/chef',
  cashier: '/staff/cashier',
  employee: '/staff/employee',
}

export default function StaffLoginPage() {
  const { login } = useStaff()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(username.trim(), password)
      navigate(ROLE_HOME[user.role])
    } catch {
      setError('Invalid username or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Staff login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Opening a restaurant?{' '}
        <a href="/signup" className="font-medium text-slate-900 underline">
          Register it here
        </a>
      </p>
    </div>
  )
}
