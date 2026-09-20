import { useQuery, useQueryClient } from '@tanstack/react-query'
import StaffLayout from '../../components/StaffLayout'
import { approveRestaurant, fetchAllRestaurants, suspendRestaurant } from '../../api/restaurants'

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['all-restaurants'], queryFn: () => fetchAllRestaurants() })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['all-restaurants'] })

  return (
    <StaffLayout title="Platform admin — Restaurants">
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
    </StaffLayout>
  )
}
