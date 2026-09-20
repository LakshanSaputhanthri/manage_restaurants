import { useEffect, useRef } from 'react'
import { WS_BASE_URL, customerTokenStore } from '../api/client'
import type { Order } from '../api/types'

export function useOrderSocket(
  orderId: string | null | undefined,
  onUpdate: (order: Order) => void,
  onReconnect?: () => void,
) {
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate
  const onReconnectRef = useRef(onReconnect)
  onReconnectRef.current = onReconnect

  useEffect(() => {
    if (!orderId) return
    let socket: WebSocket | null = null
    let closedByCleanup = false
    let retryTimer: ReturnType<typeof setTimeout>
    let isReconnect = false

    const connect = () => {
      const token = customerTokenStore.get()
      socket = new WebSocket(`${WS_BASE_URL}/ws/orders/${orderId}/?token=${token}`)
      socket.onopen = () => {
        // A dropped connection can miss push events entirely (the channel
        // layer doesn't replay history), so resync via REST on reconnect.
        if (isReconnect) onReconnectRef.current?.()
        isReconnect = true
      }
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data) as { type: string; order: Order }
        if (data.type === 'order.update') onUpdateRef.current(data.order)
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
  }, [orderId])
}
