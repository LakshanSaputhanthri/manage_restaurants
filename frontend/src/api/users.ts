import { staffApi } from './client'
import type { Paginated, StaffUser } from './types'

export async function fetchAllUsers() {
  const { data } = await staffApi.get('/api/auth/users/')
  return data as Paginated<StaffUser>
}

export async function fetchUser(id: number | string) {
  const { data } = await staffApi.get(`/api/auth/users/${id}/`)
  return data as StaffUser
}

export async function changeUserPassword(id: number | string, password: string) {
  const { data } = await staffApi.post(`/api/auth/users/${id}/set_password/`, { password })
  return data as StaffUser
}
