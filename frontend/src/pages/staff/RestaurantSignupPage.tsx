import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerRestaurant } from '../../api/restaurants'
import { staffTokenStore } from '../../api/client'

export default function RestaurantSignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    restaurant_name: '',
    owner_username: '',
    owner_password: '',
    address: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await registerRestaurant(form)
      staffTokenStore.set(result.access, result.refresh)
      navigate('/staff/owner')
    } catch {
      setError('Could not register — check that the username is not already taken.')
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
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          placeholder="Owner username"
          value={form.owner_username}
          onChange={(e) => setForm({ ...form, owner_username: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="password"
          placeholder="Owner password"
          value={form.owner_password}
          onChange={(e) => setForm({ ...form, owner_password: e.target.value })}
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
    </div>
  )
}
