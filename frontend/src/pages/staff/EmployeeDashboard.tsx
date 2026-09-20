import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import StaffLayout from '../../components/StaffLayout'
import { fetchRestaurantOrders, markOrderPickedUp, markOrderServed } from '../../api/orders'
import type { Order } from '../../api/types'
import { useStaff } from '../../context/StaffContext'
import { useRestaurantSocket } from '../../ws/useRestaurantSocket'

export default function EmployeeDashboard() {
  const { user } = useStaff()
  const queryClient = useQueryClient()
  const [orders, setOrders] = useState<Order[]>([])

  const queryKey = ['restaurant-orders', 'ready']
  const { data } = useQuery({
    queryKey,
    queryFn: () => fetchRestaurantOrders({ status: 'ready' }),
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
        return order.status === 'ready' ? [...withoutOrder, order] : withoutOrder
      })
    },
    undefined,
    () => queryClient.invalidateQueries({ queryKey }),
  )

  const handleComplete = async (order: Order) => {
    if (order.order_type === 'dine_in') await markOrderServed(order.id)
    else await markOrderPickedUp(order.id)
    setOrders((prev) => prev.filter((o) => o.id !== order.id))
  }

  return (
    <StaffLayout title="Ready orders">
      {orders.length === 0 && <p className="text-slate-500">Nothing ready to serve or hand over right now.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase">
                {order.order_type === 'dine_in' ? `Table ${order.table_number}` : 'Takeaway'}
              </span>
              <span className="text-xs text-slate-400">#{order.id.slice(0, 6)}</span>
            </div>
            <p className="mb-1 text-sm font-medium text-slate-700">{order.customer_name}</p>
            <ul className="mb-3 space-y-1 text-sm text-slate-700">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.item_name}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleComplete(order)}
              className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white"
            >
              {order.order_type === 'dine_in' ? 'Mark served' : 'Mark picked up'}
            </button>
          </div>
        ))}
      </div>
    </StaffLayout>
  )
}
