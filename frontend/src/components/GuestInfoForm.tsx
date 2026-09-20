import { useState, type FormEvent } from 'react'
import { useCustomer } from '../context/CustomerContext'

export default function GuestInfoForm({ restaurantName }: { restaurantName: string }) {
  const { startGuestSession } = useCustomer()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await startGuestSession(name.trim(), phone.trim())
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">{restaurantName}</h1>
      <p className="mb-6 text-slate-500">Just your name and phone number to start your order.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone number</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            placeholder="07XXXXXXXX"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Starting…' : 'Continue to menu'}
        </button>
      </form>
    </div>
  )
}
