import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import StaffLayout from '../../components/StaffLayout'
import { fetchRestaurantOrders, markOrderReady } from '../../api/orders'
import type { Order } from '../../api/types'
import { useStaff } from '../../context/StaffContext'
import { useRestaurantSocket } from '../../ws/useRestaurantSocket'

export default function ChefDashboard() {
  const { user } = useStaff()
  const queryClient = useQueryClient()
  const [orders, setOrders] = useState<Order[]>([])

  const queryKey = ['restaurant-orders', 'preparing']
  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchRestaurantOrders({ status: 'preparing' }),
    refetchInterval: 15000,
  })

  useEffect(() => {
    if (data) setOrders(data.results)
  }, [data])

  useRestaurantSocket(
    user?.restaurant,
    (order) => {
      setOrders((prev) => {
        const withoutOrder = prev.filter((o) => o.id !== order.id)
        return order.status === 'preparing' ? [...withoutOrder, order] : withoutOrder
      })
    },
    undefined,
    () => queryClient.invalidateQueries({ queryKey }),
  )

  const handleReady = async (id: string) => {
    await markOrderReady(id)
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <StaffLayout title="Kitchen — Orders to prepare">
      {orders.length === 0 && <p className="text-slate-500">No orders in the kitchen right now.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase">
                {order.order_type === 'dine_in' ? `Table ${order.table_number}` : 'Takeaway'}
              </span>
              <span className="text-xs text-slate-400">#{order.id.slice(0, 6)}</span>
            </div>
            <ul className="mb-3 space-y-1 text-sm text-slate-700">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.item_name}
                  {item.notes && <span className="text-slate-400"> — {item.notes}</span>}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleReady(order.id)}
              className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white"
            >
              Mark ready
            </button>
          </div>
        ))}
      </div>
    </StaffLayout>
  )
}
