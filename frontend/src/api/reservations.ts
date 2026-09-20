import { customerApi, staffApi } from './client'
import type { Paginated, Reservation } from './types'

export async function createReservation(payload: {
  restaurant_slug: string
  date: string
  time: string
  party_size: number
  notes?: string
}) {
  const { data } = await customerApi.post('/api/reservations/create/', payload)
  return data as Reservation
}

export async function fetchMyReservations() {
  const { data } = await customerApi.get('/api/reservations/mine/')
  return data as Paginated<Reservation>
}

export async function fetchRestaurantReservations(status?: string) {
  const { data } = await staffApi.get('/api/reservations/', { params: { status } })
  return data as Paginated<Reservation>
}

export async function confirmReservation(id: number, tableId: number) {
  const { data } = await staffApi.post(`/api/reservations/${id}/confirm/`, { table: tableId })
  return data as Reservation
}

export async function cancelReservation(id: number) {
  const { data } = await staffApi.post(`/api/reservations/${id}/cancel/`)
  return data as Reservation
}

export async function completeReservation(id: number) {
  const { data } = await staffApi.post(`/api/reservations/${id}/complete/`)
  return data as Reservation
}
