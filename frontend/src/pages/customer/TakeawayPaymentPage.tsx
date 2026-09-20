import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { submitTakeawayPayment } from '../../api/payments'
import type { PaymentMethod } from '../../api/types'

const OPTIONS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: 'online_stub', label: 'Pay online', hint: 'Simulated online payment — confirms instantly.' },
  { value: 'cash', label: 'Pay cash at counter', hint: 'A cashier will confirm once you pay in person.' },
  { value: 'bank_transfer', label: 'Bank transfer', hint: 'Upload your transfer slip for the cashier to verify.' },
]

export default function TakeawayPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [method, setMethod] = useState<PaymentMethod>('online_stub')
  const [slip, setSlip] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (method === 'bank_transfer' && !slip) {
      setError('Please attach your bank transfer slip.')
      return
    }
    setSubmitting(true)
    try {
      await submitTakeawayPayment(orderId as string, method, slip ?? undefined)
      navigate(`/order/${orderId}`)
    } catch {
      setError('Payment submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">How would you like to pay?</h1>
      <p className="mb-6 text-slate-500">Your order will start being prepared once payment is confirmed.</p>

      <div className="space-y-3">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`block cursor-pointer rounded-xl border p-4 ${
              method === option.value ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                checked={method === option.value}
                onChange={() => setMethod(option.value)}
              />
              <div>
                <p className="font-medium text-slate-900">{option.label}</p>
                <p className="text-sm text-slate-500">{option.hint}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      {method === 'bank_transfer' && (
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Transfer slip</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSlip(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Confirm payment'}
      </button>
    </div>
  )
}
