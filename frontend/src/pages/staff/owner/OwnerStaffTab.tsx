import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { createStaffMember, deleteStaffMember, fetchStaffMembers } from '../../../api/restaurants'

export default function OwnerStaffTab() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['my-staff'], queryFn: fetchStaffMembers })
  const [form, setForm] = useState<{ username: string; password: string; role: 'chef' | 'cashier' | 'employee' }>({
    username: '',
    password: '',
    role: 'chef',
  })
  const [error, setError] = useState('')

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createStaffMember(form)
      setForm({ username: '', password: '', role: 'chef' })
      queryClient.invalidateQueries({ queryKey: ['my-staff'] })
    } catch {
      setError('Could not create that staff account — username may already be taken.')
    }
  }

  const handleDelete = async (id: number) => {
    await deleteStaffMember(id)
    queryClient.invalidateQueries({ queryKey: ['my-staff'] })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleAdd} className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-800">Add staff member</h2>
        <input
          required
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="password"
          placeholder="Temporary password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="chef">Chef</option>
          <option value="cashier">Cashier</option>
          <option value="employee">Employee</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white">
          Create account
        </button>
      </form>

      <div>
        <h2 className="mb-3 font-semibold text-slate-800">Team</h2>
        <div className="space-y-2">
          {data?.results.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div>
                <p className="font-medium text-slate-800">{member.username}</p>
                <p className="text-sm capitalize text-slate-500">{member.role}</p>
              </div>
              <button onClick={() => handleDelete(member.id)} className="text-xs text-red-600">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
