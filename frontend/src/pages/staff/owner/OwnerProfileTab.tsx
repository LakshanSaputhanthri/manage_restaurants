import { useQuery } from '@tanstack/react-query'
import { fetchMyRestaurant } from '../../../api/restaurants'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending platform approval',
  active: 'Active — visible to customers',
  suspended: 'Suspended',
}

export default function OwnerProfileTab() {
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['my-restaurant'],
    queryFn: fetchMyRestaurant,
  })

  if (isLoading || !restaurant) return <p className="text-slate-500">Loading…</p>

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <p className="text-sm text-slate-500">Restaurant name</p>
        <p className="text-lg font-semibold text-slate-900">{restaurant.name}</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Public link (table QR / signage)</p>
        <p className="font-mono text-sm text-slate-700">/r/{restaurant.slug}</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Status</p>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
            restaurant.status === 'active'
              ? 'bg-emerald-100 text-emerald-700'
              : restaurant.status === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {STATUS_LABEL[restaurant.status]}
        </span>
        {restaurant.status === 'pending' && (
          <p className="mt-2 text-sm text-slate-500">
            Your restaurant is awaiting approval from the platform admin — customers can't order yet.
          </p>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-500">Address</p>
        <p className="text-slate-800">{restaurant.address || '—'}</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Phone</p>
        <p className="text-slate-800">{restaurant.phone || '—'}</p>
      </div>
    </div>
  )
}
