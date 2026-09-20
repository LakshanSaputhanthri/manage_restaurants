import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPublicRestaurant } from '../../api/restaurants'
import { createReservation } from '../../api/reservations'
import GuestInfoForm from '../../components/GuestInfoForm'
import { useCustomer } from '../../context/CustomerContext'

export default function ReservationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { customer } = useCustomer()
  const { data: restaurant } = useQuery({
    queryKey: ['public-restaurant', slug],
    queryFn: () => fetchPublicRestaurant(slug as string),
    enabled: !!slug,
  })

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!restaurant) return <p className="p-6 text-slate-500">Loading…</p>
  if (!customer) return <GuestInfoForm restaurantName={restaurant.name} />

  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Reservation requested!</h1>
        <p className="text-slate-500">{restaurant.name} will confirm your table shortly.</p>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createReservation({ restaurant_slug: slug as string, date, time, party_size: partySize })
      setDone(true)
    } catch {
      setError('Could not create the reservation. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Reserve a table</h1>
      <p className="mb-6 text-slate-500">{restaurant.name}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="number"
          min={1}
          value={partySize}
          onChange={(e) => setPartySize(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white">
          Request reservation
        </button>
      </form>
    </div>
  )
}
