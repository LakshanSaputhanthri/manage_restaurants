import { publicApi, staffApi } from './client'
import type { Paginated, Restaurant, StaffRole } from './types'

export async function fetchPublicRestaurant(slug: string) {
  const { data } = await publicApi.get(`/api/restaurants/public/${slug}/`)
  return data as Restaurant
}

export async function registerRestaurant(payload: {
  restaurant_name: string
  address: string
  phone: string
  owner_name: string
  owner_address: string
  owner_email: string
  owner_password: string
  owner_password_confirm: string
}) {
  const { data } = await publicApi.post('/api/restaurants/register/', payload)
  return data as { restaurant: Restaurant; access: string; refresh: string }
}

export async function fetchMyRestaurant() {
  const { data } = await staffApi.get('/api/restaurants/mine/')
  return data as Restaurant
}

export async function updateMyRestaurant(payload: Partial<Restaurant>) {
  const { data } = await staffApi.patch('/api/restaurants/mine/', payload)
  return data as Restaurant
}

export async function fetchAllRestaurants(status?: string) {
  const { data } = await staffApi.get('/api/restaurants/admin/', { params: { status } })
  return data as Paginated<Restaurant>
}

export async function approveRestaurant(id: number) {
  const { data } = await staffApi.post(`/api/restaurants/admin/${id}/approve/`)
  return data as Restaurant
}

export async function suspendRestaurant(id: number) {
  const { data } = await staffApi.post(`/api/restaurants/admin/${id}/suspend/`)
  return data as Restaurant
}

export interface StaffMember {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: StaffRole
  is_active: boolean
}

export async function fetchStaffMembers() {
  const { data } = await staffApi.get('/api/restaurants/staff/')
  return data as Paginated<StaffMember>
}

export async function createStaffMember(payload: {
  username: string
  password: string
  role: 'chef' | 'cashier' | 'employee'
  email?: string
}) {
  const { data } = await staffApi.post('/api/restaurants/staff/', payload)
  return data as StaffMember
}

export async function deleteStaffMember(id: number) {
  await staffApi.delete(`/api/restaurants/staff/${id}/`)
}
