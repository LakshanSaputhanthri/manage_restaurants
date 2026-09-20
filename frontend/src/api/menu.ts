import { publicApi, staffApi } from './client'
import type { Category, MenuItem, Paginated } from './types'

export async function fetchPublicMenu(slug: string) {
  const { data } = await publicApi.get(`/api/restaurants/${slug}/menu/`)
  return data as Paginated<Category>
}

export async function fetchMyCategories() {
  const { data } = await staffApi.get('/api/menu/categories/')
  return data as Paginated<Category>
}

export async function createCategory(payload: { name: string; sort_order?: number }) {
  const { data } = await staffApi.post('/api/menu/categories/', payload)
  return data as Category
}

export async function fetchMyMenuItems() {
  const { data } = await staffApi.get('/api/menu/items/')
  return data as Paginated<MenuItem>
}

export async function createMenuItem(payload: {
  name: string
  price: string
  category?: number | null
  description?: string
}) {
  const { data } = await staffApi.post('/api/menu/items/', payload)
  return data as MenuItem
}

export async function updateMenuItem(id: number, payload: Partial<MenuItem>) {
  const { data } = await staffApi.patch(`/api/menu/items/${id}/`, payload)
  return data as MenuItem
}

export async function deleteMenuItem(id: number) {
  await staffApi.delete(`/api/menu/items/${id}/`)
}
