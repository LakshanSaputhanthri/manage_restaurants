import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { resolveTableByQr } from '../../api/tables'
import GuestInfoForm from '../../components/GuestInfoForm'
import { useCustomer } from '../../context/CustomerContext'
import OrderingPage from './OrderingPage'

export default function TableEntryPage() {
  const { slug, qrUuid } = useParams<{ slug: string; qrUuid: string }>()
  const { customer, loading } = useCustomer()

  const { data: table, isLoading, error } = useQuery({
    queryKey: ['resolve-table', qrUuid],
    queryFn: () => resolveTableByQr(qrUuid as string),
    enabled: !!qrUuid,
  })

  if (isLoading || loading) return <CenteredMessage text="Loading…" />
  if (error || !table) return <CenteredMessage text="This table QR code doesn't look valid." />

  if (!customer) return <GuestInfoForm restaurantName={table.restaurant_name} />

  return (
    <OrderingPage
      restaurantSlug={slug as string}
      restaurantName={table.restaurant_name}
      orderType="dine_in"
      tableQrUuid={qrUuid}
      tableNumber={table.number}
    />
  )
}

function CenteredMessage({ text }: { text: string }) {
  return <div className="flex min-h-screen items-center justify-center px-6 text-center text-slate-500">{text}</div>
}
