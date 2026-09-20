import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import StaffLayout from '../../components/StaffLayout'
import { fetchRestaurantOrders, payDineInOrder } from '../../api/orders'
import { fetchPendingPayments, rejectPayment, verifyPayment } from '../../api/payments'
import type { Order, Payment } from '../../api/types'
import { useStaff } from '../../context/StaffContext'
import { useRestaurantSocket } from '../../ws/useRestaurantSocket'

export default function CashierDashboard() {
  const { user } = useStaff()
  const queryClient = useQueryClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [bills, setBills] = useState<Order[]>([])

  const { data: pendingPayments } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: fetchPendingPayments,
    refetchInterval: 15000,
  })
  const { data: servedOrders } = useQuery({
    queryKey: ['restaurant-orders', 'served'],
    queryFn: () => fetchRestaurantOrders({ status: 'served' }),
    refetchInterval: 15000,
  })

  useEffect(() => {
    if (pendingPayments) setPayments(pendingPayments.results)
  }, [pendingPayments])
  useEffect(() => {
    if (servedOrders) setBills(servedOrders.results)
  }, [servedOrders])

  useRestaurantSocket(
    user?.restaurant,
    (order) => {
      setBills((prev) => {
        const without = prev.filter((o) => o.id !== order.id)
        return order.status === 'served' ? [...without, order] : without
      })
    },
    (payment) => {
      setPayments((prev) => {
        const without = prev.filter((p) => p.id !== payment.id)
        return payment.status === 'pending' ? [...without, payment] : without
      })
    },
    () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders', 'served'] })
    },
  )

  const handleVerify = async (orderId: string) => {
    await verifyPayment(orderId)
    setPayments((prev) => prev.filter((p) => p.order_id !== orderId))
  }

  const handleReject = async (orderId: string) => {
    const reason = window.prompt('Reason for rejecting this payment?') ?? ''
    await rejectPayment(orderId, reason)
    setPayments((prev) => prev.filter((p) => p.order_id !== orderId))
  }

  const handlePay = async (orderId: string, method: 'cash' | 'online_stub') => {
    await payDineInOrder(orderId, method)
    setBills((prev) => prev.filter((o) => o.id !== orderId))
  }

  return (
    <StaffLayout title="Cashier">
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Payments to verify</h2>
        {payments.length === 0 && <p className="text-slate-500">Nothing waiting on verification.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-medium uppercase text-slate-500">{payment.method.replace('_', ' ')}</p>
              <p className="mb-2 text-lg font-semibold text-slate-900">{payment.amount}</p>
              {payment.slip_image && (
                <a href={payment.slip_image} target="_blank" rel="noreferrer" className="mb-3 block">
                  <img src={payment.slip_image} alt="Transfer slip" className="max-h-40 rounded-lg border" />
                </a>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerify(payment.order_id)}
                  className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleReject(payment.order_id)}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Dine-in bills to close</h2>
        {bills.length === 0 && <p className="text-slate-500">No served tables awaiting payment.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bills.map((order) => (
            <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-medium text-slate-500">Table {order.table_number}</p>
              <p className="mb-3 text-lg font-semibold text-slate-900">{order.total_amount}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePay(order.id, 'cash')}
                  className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white"
                >
                  Paid cash
                </button>
                <button
                  onClick={() => handlePay(order.id, 'online_stub')}
                  className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700"
                >
                  Paid online
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </StaffLayout>
  )
}
