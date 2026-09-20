import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { fetchPublicRestaurant } from '../../api/restaurants'
import GuestInfoForm from '../../components/GuestInfoForm'
import { useCustomer } from '../../context/CustomerContext'
import OrderingPage from './OrderingPage'

export default function TakeawayEntryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { customer, loading } = useCustomer()

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['public-restaurant', slug],
    queryFn: () => fetchPublicRestaurant(slug as string),
    enabled: !!slug,
  })

  if (isLoading || loading) return <CenteredMessage text="Loading…" />
  if (error || !restaurant) return <CenteredMessage text="We couldn't find this restaurant." />

  if (!customer) return <GuestInfoForm restaurantName={restaurant.name} />

  return <OrderingPage restaurantSlug={slug as string} restaurantName={restaurant.name} orderType="takeaway" />
}

function CenteredMessage({ text }: { text: string }) {
  return <div className="flex min-h-screen items-center justify-center px-6 text-center text-slate-500">{text}</div>
}
