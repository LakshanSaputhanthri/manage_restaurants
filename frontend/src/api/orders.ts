import { customerApi, staffApi } from './client'
import type { CartLine, Order, OrderStatus, OrderType, Paginated } from './types'

function toItemsPayload(cart: CartLine[]) {
  return cart.map((line) => ({
    menu_item_id: line.menu_item_id,
    quantity: line.quantity,
    notes: line.notes ?? '',
  }))
}

export async function createDineInOrder(tableQrUuid: string, cart: CartLine[], notes = '') {
  const { data } = await customerApi.post('/api/orders/dine-in/', {
    table_qr_uuid: tableQrUuid,
    items: toItemsPayload(cart),
    notes,
  })
  return data as Order
}

export async function createTakeawayOrder(restaurantSlug: string, cart: CartLine[], notes = '') {
  const { data } = await customerApi.post('/api/orders/takeaway/', {
    restaurant_slug: restaurantSlug,
    items: toItemsPayload(cart),
    notes,
  })
  return data as Order
}

export async function fetchMyOrder(orderId: string) {
  const { data } = await customerApi.get(`/api/orders/mine/${orderId}/`)
  return data as Order
}

export async function fetchMyOrders() {
  const { data } = await customerApi.get('/api/orders/mine/')
  return data as Paginated<Order>
}

export async function fetchRestaurantOrders(filters: { status?: OrderStatus; order_type?: OrderType } = {}) {
  const { data } = await staffApi.get('/api/orders/', { params: filters })
  return data as Paginated<Order>
}

export async function markOrderReady(orderId: string) {
  const { data } = await staffApi.post(`/api/orders/${orderId}/ready/`)
  return data as Order
}

export async function markOrderServed(orderId: string) {
  const { data } = await staffApi.post(`/api/orders/${orderId}/served/`)
  return data as Order
}

export async function markOrderPickedUp(orderId: string) {
  const { data } = await staffApi.post(`/api/orders/${orderId}/picked_up/`)
  return data as Order
}

export async function payDineInOrder(orderId: string, method: 'cash' | 'online_stub') {
  const { data } = await staffApi.post(`/api/orders/${orderId}/pay/`, { method })
  return data as Order
}

export async function cancelOrder(orderId: string, reason = '') {
  const { data } = await staffApi.post(`/api/orders/${orderId}/cancel/`, { reason })
  return data as Order
}
