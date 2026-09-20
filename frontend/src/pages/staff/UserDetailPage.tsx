import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import StaffLayout from '../../components/StaffLayout'
import { changeUserPassword, fetchUser } from '../../api/users'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user, isLoading } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id!) })

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      await changeUserPassword(id!, password)
      setPassword('')
      setConfirmPassword('')
      setSuccess('Password updated successfully.')
    } catch {
      setError('Could not update the password.')
    }
  }

  return (
    <StaffLayout title="Platform admin — User detail">
      <Link to="/staff/admin" className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700">
        &larr; Back to users
      </Link>

      {isLoading && <p className="text-slate-500">Loading…</p>}

      {user && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-fit space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-800">Account details</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Username</dt>
                <dd className="font-medium text-slate-800">{user.username}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-800">
                  {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-800">{user.email || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Role</dt>
                <dd className="font-medium capitalize text-slate-800">{user.role.replace('_', ' ')}</dd>
              </div>
            </dl>
          </div>

          <form onSubmit={handleChangePassword} className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-800">Change password</h2>
            <input
              required
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              required
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <button type="submit" className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white">
              Update password
            </button>
          </form>
        </div>
      )}
    </StaffLayout>
  )
}
