import { useState } from 'react'
import StaffLayout from '../../components/StaffLayout'
import OwnerTablesTab from './owner/OwnerTablesTab'
import OwnerMenuTab from './owner/OwnerMenuTab'
import OwnerStaffTab from './owner/OwnerStaffTab'
import OwnerReservationsTab from './owner/OwnerReservationsTab'
import OwnerProfileTab from './owner/OwnerProfileTab'

const TABS = ['Profile', 'Tables', 'Menu', 'Staff', 'Reservations'] as const
type Tab = (typeof TABS)[number]

export default function OwnerDashboard() {
  const [tab, setTab] = useState<Tab>('Profile')

  return (
    <StaffLayout title="Restaurant admin">
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

      {tab === 'Profile' && <OwnerProfileTab />}
      {tab === 'Tables' && <OwnerTablesTab />}
      {tab === 'Menu' && <OwnerMenuTab />}
      {tab === 'Staff' && <OwnerStaffTab />}
      {tab === 'Reservations' && <OwnerReservationsTab />}
    </StaffLayout>
  )
}
