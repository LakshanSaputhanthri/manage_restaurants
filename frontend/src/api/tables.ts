import { publicApi, staffApi } from './client'
import type { Paginated, Table } from './types'

export async function resolveTableByQr(qrUuid: string) {
  const { data } = await publicApi.get(`/api/tables/qr/${qrUuid}/`)
  return data as { id: number; number: string; status: string; restaurant_name: string; restaurant_slug: string }
}

export async function fetchMyTables() {
  const { data } = await staffApi.get('/api/tables/')
  return data as Paginated<Table>
}

export async function createTable(payload: { number: string; capacity: number }) {
  const { data } = await staffApi.post('/api/tables/', payload)
  return data as Table
}

export async function deleteTable(id: number) {
  await staffApi.delete(`/api/tables/${id}/`)
}

// The QR endpoints require the owner's JWT, which an <img src> can't send,
// so we fetch the PNG as a blob and hand back an object URL to render instead.
async function fetchQrObjectUrl(path: string) {
  const { data } = await staffApi.get(path, { responseType: 'blob' })
  return URL.createObjectURL(data as Blob)
}

export function fetchTableQrImage(tableId: number) {
  return fetchQrObjectUrl(`/api/tables/${tableId}/qr/`)
}

export function fetchTakeawayQrImage() {
  return fetchQrObjectUrl('/api/restaurants/mine/order-qr.png')
}
