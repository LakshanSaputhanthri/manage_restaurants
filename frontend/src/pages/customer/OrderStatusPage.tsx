import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { fetchMyOrder } from '../../api/orders'
import type { Order, OrderStatus } from '../../api/types'
import { useOrderSocket } from '../../ws/useOrderSocket'

const DINE_IN_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Served' },
  { key: 'completed', label: 'Paid' },
]

const TAKEAWAY_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'awaiting_payment', label: 'Awaiting payment' },
  { key: 'payment_verifying', label: 'Verifying payment' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'picked_up', label: 'Picked up' },
]

export default function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ['my-order', orderId],
    queryFn: () => fetchMyOrder(orderId as string),
    enabled: !!orderId,
  })

  useOrderSocket(
    orderId,
    (updated) => {
      queryClient.setQueryData(['my-order', orderId], updated)
    },
    () => queryClient.invalidateQueries({ queryKey: ['my-order', orderId] }),
  )

  if (isLoading || !order) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading order…</div>
  }

  const steps = order.order_type === 'dine_in' ? DINE_IN_STEPS : TAKEAWAY_STEPS
  const activeIndex = steps.findIndex((s) => s.key === order.status)

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Order status</h1>
      <p className="mb-6 text-slate-500">Order #{order.id.slice(0, 8)}</p>

      {order.status === 'cancelled' ? (
        <div className="rounded-xl bg-red-50 p-4 text-red-700">This order was cancelled.</div>
      ) : (
        <ol className="mb-8 space-y-2">
          {steps.map((step, i) => (
            <li
              key={step.key}
              className={`flex items-center gap-3 rounded-lg p-3 ${
                i === activeIndex
                  ? 'bg-emerald-50 font-semibold text-emerald-700'
                  : i < activeIndex
                    ? 'text-slate-400 line-through'
                    : 'text-slate-500'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  i <= activeIndex ? 'bg-emerald-600 text-white' : 'bg-slate-200'
                }`}
              >
                {i + 1}
              </span>
              {step.label}
            </li>
          ))}
        </ol>
      )}

      <OrderSummary order={order} />
    </div>
  )
}

function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h2 className="mb-3 font-semibold text-slate-800">Items</h2>
      <ul className="mb-3 space-y-1 text-sm text-slate-700">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.quantity} × {item.item_name}
            </span>
            <span>{(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
        <span>Total</span>
        <span>{order.total_amount}</span>
      </div>
      {order.table_number && <p className="mt-2 text-sm text-slate-500">Table {order.table_number}</p>}
    </div>
  )
}
