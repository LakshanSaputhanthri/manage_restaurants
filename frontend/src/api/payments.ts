import { customerApi, staffApi } from './client'
import type { Order, Paginated, Payment, PaymentMethod } from './types'

export async function submitTakeawayPayment(orderId: string, method: PaymentMethod, slipImage?: File) {
  const form = new FormData()
  form.append('order_id', orderId)
  form.append('method', method)
  if (slipImage) form.append('slip_image', slipImage)
  const { data } = await customerApi.post('/api/payments/submit/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data as { order: Order; payment: Payment }
}

export async function fetchPendingPayments() {
  const { data } = await staffApi.get('/api/payments/pending/')
  return data as Paginated<Payment>
}

export async function verifyPayment(orderId: string) {
  const { data } = await staffApi.post(`/api/payments/${orderId}/verify/`)
  return data as Order
}

export async function rejectPayment(orderId: string, reason = '') {
  const { data } = await staffApi.post(`/api/payments/${orderId}/reject/`, { reason })
  return data as Order
}
