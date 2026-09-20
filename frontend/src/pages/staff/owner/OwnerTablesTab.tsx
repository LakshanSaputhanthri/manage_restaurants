import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { createTable, deleteTable, fetchMyTables, fetchTableQrImage, fetchTakeawayQrImage } from '../../../api/tables'
import type { Table } from '../../../api/types'

function QrImage({ loader, alt }: { loader: () => Promise<string>; alt: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    loader().then((u) => {
      objectUrl = u
      setUrl(u)
    })
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!url) return <p className="text-xs text-slate-400">Loading QR…</p>
  return <img src={url} alt={alt} className="h-32 w-32" />
}

export default function OwnerTablesTab() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['my-tables'], queryFn: fetchMyTables })
  const [number, setNumber] = useState('')
  const [capacity, setCapacity] = useState(4)

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    await createTable({ number, capacity })
    setNumber('')
    queryClient.invalidateQueries({ queryKey: ['my-tables'] })
  }

  const handleDelete = async (id: number) => {
    await deleteTable(id)
    queryClient.invalidateQueries({ queryKey: ['my-tables'] })
  }

  return (
    <div>
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-2 font-semibold text-slate-800">Common takeaway QR</h2>
        <p className="mb-3 text-sm text-slate-500">
          Print this once — it works for every takeaway/online order, whether scanned in-store or shared online.
        </p>
        <QrImage loader={fetchTakeawayQrImage} alt="Takeaway QR" />
      </div>

      <form onSubmit={handleAdd} className="mb-6 flex items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Table number</label>
          <input
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Capacity</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Add table
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.results.map((table: Table) => (
          <div key={table.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-slate-900">Table {table.number}</p>
              <button onClick={() => handleDelete(table.id)} className="text-xs text-red-600">
                Remove
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-500">Seats {table.capacity}</p>
            <QrImage loader={() => fetchTableQrImage(table.id)} alt={`Table ${table.number} QR`} />
          </div>
        ))}
      </div>
    </div>
  )
}
