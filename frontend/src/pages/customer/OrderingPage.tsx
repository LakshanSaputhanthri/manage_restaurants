import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPublicMenu } from '../../api/menu'
import { createDineInOrder, createTakeawayOrder } from '../../api/orders'
import type { MenuItem } from '../../api/types'
import { useCart } from '../../context/CartContext'

interface Props {
  restaurantSlug: string
  restaurantName: string
  orderType: 'dine_in' | 'takeaway'
  tableQrUuid?: string
  tableNumber?: string
}

export default function OrderingPage({ restaurantSlug, restaurantName, orderType, tableQrUuid, tableNumber }: Props) {
  const navigate = useNavigate()
  const { lines, addItem, setQuantity, total, clear } = useCart()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-menu', restaurantSlug],
    queryFn: () => fetchPublicMenu(restaurantSlug),
  })

  const lineFor = (itemId: number) => lines.find((l) => l.menu_item_id === itemId)

  const handlePlaceOrder = async () => {
    setError('')
    setPlacing(true)
    try {
      if (orderType === 'dine_in') {
        const order = await createDineInOrder(tableQrUuid as string, lines)
        clear()
        navigate(`/order/${order.id}`)
      } else {
        const order = await createTakeawayOrder(restaurantSlug, lines)
        clear()
        navigate(`/order/${order.id}/pay`)
      }
    } catch {
      setError('Could not place your order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{restaurantName}</h1>
        <p className="text-slate-500">
          {orderType === 'dine_in' ? `Dine-in — Table ${tableNumber ?? ''}` : 'Takeaway order'}
        </p>
      </header>

      {isLoading && <p className="text-slate-500">Loading menu…</p>}

      {categories?.results.map((category) => (
        <section key={category.id} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">{category.name}</h2>
          <div className="space-y-3">
            {category.items?.map((item: MenuItem) => {
              const line = lineFor(item.id)
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="pr-4">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                    <p className="mt-1 text-sm font-semibold text-slate-700">{item.price}</p>
                  </div>
                  {line ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(item.id, line.quantity - 1)}
                        className="h-8 w-8 rounded-full bg-slate-100 font-bold text-slate-700"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-medium">{line.quantity}</span>
                      <button
                        onClick={() => setQuantity(item.id, line.quantity + 1)}
                        className="h-8 w-8 rounded-full bg-slate-100 font-bold text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem(item)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      Add
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{lines.length} item(s)</p>
              <p className="text-lg font-semibold text-slate-900">Total: {total.toFixed(2)}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {placing ? 'Placing…' : 'Place order'}
            </button>
          </div>
          {error && <p className="mx-auto mt-2 max-w-2xl text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
