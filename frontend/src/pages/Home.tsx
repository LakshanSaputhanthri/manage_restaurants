import { buttonVariants } from '@heroui/react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">Restaurant QR Ordering</h1>
      <p className="mb-4 text-slate-500">
        Customers reach this app by scanning a table QR or a restaurant's takeaway QR — this landing
        page is just for staff and restaurant owners.
      </p>
      <Link to="/staff/login" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
        Staff login
      </Link>
      <Link to="/signup" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
        Register a restaurant
      </Link>
    </div>
  )
}
