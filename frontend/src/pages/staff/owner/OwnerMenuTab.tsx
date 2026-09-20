import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import {
  createCategory,
  createMenuItem,
  deleteMenuItem,
  fetchMyCategories,
  fetchMyMenuItems,
  updateMenuItem,
} from '../../../api/menu'

export default function OwnerMenuTab() {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['my-categories'], queryFn: fetchMyCategories })
  const { data: items } = useQuery({ queryKey: ['my-menu-items'], queryFn: fetchMyMenuItems })

  const [categoryName, setCategoryName] = useState('')
  const [itemForm, setItemForm] = useState({ name: '', price: '', category: '', description: '' })

  const refreshItems = () => queryClient.invalidateQueries({ queryKey: ['my-menu-items'] })
  const refreshCategories = () => queryClient.invalidateQueries({ queryKey: ['my-categories'] })

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault()
    await createCategory({ name: categoryName })
    setCategoryName('')
    refreshCategories()
  }

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault()
    await createMenuItem({
      name: itemForm.name,
      price: itemForm.price,
      description: itemForm.description,
      category: itemForm.category ? Number(itemForm.category) : null,
    })
    setItemForm({ name: '', price: '', category: '', description: '' })
    refreshItems()
  }

  const toggleAvailability = async (id: number, isAvailable: boolean) => {
    await updateMenuItem(id, { is_available: !isAvailable })
    refreshItems()
  }

  const handleDeleteItem = async (id: number) => {
    await deleteMenuItem(id)
    refreshItems()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-semibold text-slate-800">Categories</h2>
        <form onSubmit={handleAddCategory} className="mb-4 flex gap-2">
          <input
            required
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g. Desserts"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
          />
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Add
          </button>
        </form>
        <ul className="space-y-1">
          {categories?.results.map((c) => (
            <li key={c.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700">
              {c.name}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-slate-800">Menu items</h2>
        <form onSubmit={handleAddItem} className="mb-4 space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <input
            required
            placeholder="Item name"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            required
            placeholder="Price"
            value={itemForm.price}
            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <select
            value={itemForm.category}
            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">No category</option>
            {categories?.results.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Description"
            value={itemForm.description}
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <button type="submit" className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white">
            Add item
          </button>
        </form>

        <div className="space-y-2">
          {items?.results.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div>
                <p className="font-medium text-slate-800">{item.name}</p>
                <p className="text-sm text-slate-500">{item.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAvailability(item.id, !!item.is_available)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {item.is_available ? 'Available' : 'Hidden'}
                </button>
                <button onClick={() => handleDeleteItem(item.id)} className="text-xs text-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
