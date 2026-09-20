import { useEffect, useRef } from 'react'
import { WS_BASE_URL, staffTokenStore } from '../api/client'
import type { Order, Payment } from '../api/types'

type OrderEvent = { type: 'order.update'; order: Order }
type PaymentEvent = { type: 'payment.update'; payment: Payment }

export function useRestaurantSocket(
  restaurantId: number | null | undefined,
  onOrderUpdate: (order: Order) => void,
  onPaymentUpdate?: (payment: Payment) => void,
  onReconnect?: () => void,
) {
  const onOrderRef = useRef(onOrderUpdate)
  onOrderRef.current = onOrderUpdate
  const onPaymentRef = useRef(onPaymentUpdate)
  onPaymentRef.current = onPaymentUpdate
  const onReconnectRef = useRef(onReconnect)
  onReconnectRef.current = onReconnect

  useEffect(() => {
    if (!restaurantId) return
    let socket: WebSocket | null = null
    let closedByCleanup = false
    let retryTimer: ReturnType<typeof setTimeout>
    let isReconnect = false

    const connect = () => {
      const token = staffTokenStore.getAccess()
      socket = new WebSocket(`${WS_BASE_URL}/ws/restaurants/${restaurantId}/?token=${token}`)
      socket.onopen = () => {
        // A dropped connection can miss push events entirely (the channel
        // layer doesn't replay history), so resync via REST on reconnect.
        if (isReconnect) onReconnectRef.current?.()
        isReconnect = true
      }
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data) as OrderEvent | PaymentEvent
        if (data.type === 'order.update') onOrderRef.current(data.order)
        if (data.type === 'payment.update') onPaymentRef.current?.(data.payment)
      }
      socket.onclose = () => {
        if (!closedByCleanup) retryTimer = setTimeout(connect, 3000)
      }
    }
    connect()

    return () => {
      closedByCleanup = true
      clearTimeout(retryTimer)
      socket?.close()
    }
  }, [restaurantId])
}
