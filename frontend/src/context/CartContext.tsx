import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartLine, MenuItem } from '../api/types'

interface CartContextValue {
  lines: CartLine[]
  addItem: (item: MenuItem) => void
  removeItem: (menuItemId: number) => void
  setQuantity: (menuItemId: number, quantity: number) => void
  clear: () => void
  total: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const STORAGE_KEY = 'active_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CartLine[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const addItem = (item: MenuItem) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.menu_item_id === item.id)
      if (existing) {
        return prev.map((line) =>
          line.menu_item_id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const removeItem = (menuItemId: number) => {
    setLines((prev) => prev.filter((line) => line.menu_item_id !== menuItemId))
  }

  const setQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) return removeItem(menuItemId)
    setLines((prev) => prev.map((line) => (line.menu_item_id === menuItemId ? { ...line, quantity } : line)))
  }

  const clear = () => setLines([])

  const total = lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0)

  return (
    <CartContext.Provider value={{ lines, addItem, removeItem, setQuantity, clear, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
