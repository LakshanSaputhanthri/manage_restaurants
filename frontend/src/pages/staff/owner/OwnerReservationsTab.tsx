import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { cancelReservation, completeReservation, confirmReservation, fetchRestaurantReservations } from '../../../api/reservations'
import { fetchMyTables } from '../../../api/tables'

export default function OwnerReservationsTab() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['my-reservations'], queryFn: () => fetchRestaurantReservations() })
  const { data: tables } = useQuery({ queryKey: ['my-tables'], queryFn: fetchMyTables })
  const [selectedTable, setSelectedTable] = useState<Record<number, number>>({})

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['my-reservations'] })

  const handleConfirm = async (id: number) => {
    const tableId = selectedTable[id] ?? tables?.results[0]?.id
    if (!tableId) return
    await confirmReservation(id, tableId)
    refresh()
  }

  return (
    <div className="space-y-3">
      {data?.results.length === 0 && <p className="text-slate-500">No reservations yet.</p>}
      {data?.results.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <p className="font-medium text-slate-900">
              {r.customer_name} — party of {r.party_size}
            </p>
            <p className="text-sm text-slate-500">
              {r.date} at {r.time} · <span className="capitalize">{r.status}</span>
              {r.table && ` · Table ${r.table}`}
            </p>
          </div>
          {r.status === 'pending' && (
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => setSelectedTable({ ...selectedTable, [r.id]: Number(e.target.value) })}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              >
                {tables?.results.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table {t.number}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleConfirm(r.id)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                Confirm
              </button>
              <button
                onClick={() => cancelReservation(r.id).then(refresh)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                Cancel
              </button>
            </div>
          )}
          {r.status === 'confirmed' && (
            <button
              onClick={() => completeReservation(r.id).then(refresh)}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
            >
              Mark completed
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
