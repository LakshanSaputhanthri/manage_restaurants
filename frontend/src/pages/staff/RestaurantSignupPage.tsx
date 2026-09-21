import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { registerRestaurant } from '../../api/restaurants'
import { staffTokenStore } from '../../api/client'

function extractErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (!err.response) {
      return 'Could not reach the server. Check your connection and try again.'
    }
    const data = err.response.data
    if (data && typeof data === 'object') {
      const firstError = Object.values(data).flat().find((v) => typeof v === 'string')
      if (firstError) return firstError
    }
  }
  return 'Could not register. Please try again.'
}

export default function RestaurantSignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    restaurant_name: '',
    address: '',
    phone: '',
    owner_name: '',
    owner_address: '',
    owner_email: '',
    owner_password: '',
    owner_password_confirm: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.owner_password !== form.owner_password_confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const result = await registerRestaurant(form)
      staffTokenStore.set(result.access, result.refresh)
      navigate('/staff/owner')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Register your restaurant</h1>
      <p className="mb-6 text-slate-500">
        You'll be able to log in immediately — a platform admin approves your restaurant before customers can order.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Restaurant name"
          value={form.restaurant_name}
          onChange={(e) => setForm({ ...form, restaurant_name: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          placeholder="Restaurant address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          placeholder="Mobile number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          placeholder="Owner name"
          value={form.owner_name}
          onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          placeholder="Owner address"
          value={form.owner_address}
          onChange={(e) => setForm({ ...form, owner_address: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.owner_email}
          onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.owner_password}
          onChange={(e) => setForm({ ...form, owner_password: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="password"
          placeholder="Confirm password"
          value={form.owner_password_confirm}
          onChange={(e) => setForm({ ...form, owner_password_confirm: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Registering…' : 'Register restaurant'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{' '}
        <a href="/staff/login" className="font-medium text-slate-900 underline">
          Log in here
        </a>
      </p>
    </div>
  )
}
