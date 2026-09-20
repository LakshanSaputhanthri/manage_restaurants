import { customerApi, publicApi, staffApi } from './client'
import type { Customer, StaffUser } from './types'

export async function staffLogin(username: string, password: string) {
  const { data } = await publicApi.post('/api/auth/staff/login/', { username, password })
  return data as { access: string; refresh: string; user: StaffUser }
}

export async function fetchStaffMe() {
  const { data } = await staffApi.get('/api/auth/staff/me/')
  return data as StaffUser
}

export async function createGuestSession(name: string, phone: string, email = '') {
  const { data } = await publicApi.post('/api/auth/customers/guest/', { name, phone, email })
  return data as Customer
}

export async function customerLogin(phone: string, password: string) {
  const { data } = await publicApi.post('/api/auth/customers/login/', { phone, password })
  return data as Customer
}

export async function registerCustomerAccount(password: string) {
  const { data } = await customerApi.post('/api/auth/customers/register/', { password })
  return data as Customer
}

export async function fetchCustomerMe() {
  const { data } = await customerApi.get('/api/auth/customers/me/')
  return data as Customer
}
