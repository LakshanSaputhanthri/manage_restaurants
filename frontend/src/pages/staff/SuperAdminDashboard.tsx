import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import StaffLayout from '../../components/StaffLayout'
import { approveRestaurant, fetchAllRestaurants, suspendRestaurant } from '../../api/restaurants'
import { fetchAllUsers } from '../../api/users'

const TABS = ['Restaurants', 'Users'] as const
type Tab = (typeof TABS)[number]

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState<Tab>('Restaurants')
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['all-restaurants'], queryFn: () => fetchAllRestaurants() })
  const { data: users } = useQuery({ queryKey: ['all-users'], queryFn: () => fetchAllUsers() })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['all-restaurants'] })

  return (
    <StaffLayout title="Platform admin">
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Users' && (
        <div className="space-y-2">
          {users?.results.map((u) => (
            <Link
              key={u.id}
              to={`/staff/admin/users/${u.id}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-slate-300"
            >
              <div>
                <p className="font-medium text-slate-800">{u.username}</p>
                <p className="text-sm text-slate-500">{u.email || '—'}</p>
              </div>
              <span className="text-sm capitalize text-slate-500">{u.role.replace('_', ' ')}</span>
            </Link>
          ))}
        </div>
      )}

      {tab === 'Restaurants' && (
      <div className="space-y-3">
        {data?.results.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-medium text-slate-900">{r.name}</p>
              <p className="text-sm text-slate-500">
                /{r.slug} · owner: {r.owner_username} ·{' '}
                <span
                  className={
                    r.status === 'active'
                      ? 'text-emerald-600'
                      : r.status === 'pending'
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }
                >
                  {r.status}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              {r.status !== 'active' && (
                <button
                  onClick={() => approveRestaurant(r.id).then(refresh)}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  Approve
                </button>
              )}
              {r.status !== 'suspended' && (
                <button
                  onClick={() => suspendRestaurant(r.id).then(refresh)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  Suspend
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </StaffLayout>
  )
}
