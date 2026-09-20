import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RequireRole from './components/RequireRole'
import { CartProvider } from './context/CartContext'
import { CustomerProvider } from './context/CustomerContext'
import { StaffProvider } from './context/StaffContext'
import Home from './pages/Home'
import OrderStatusPage from './pages/customer/OrderStatusPage'
import ReservationPage from './pages/customer/ReservationPage'
import TableEntryPage from './pages/customer/TableEntryPage'
import TakeawayEntryPage from './pages/customer/TakeawayEntryPage'
import TakeawayPaymentPage from './pages/customer/TakeawayPaymentPage'
import CashierDashboard from './pages/staff/CashierDashboard'
import ChefDashboard from './pages/staff/ChefDashboard'
import EmployeeDashboard from './pages/staff/EmployeeDashboard'
import OwnerDashboard from './pages/staff/OwnerDashboard'
import RestaurantSignupPage from './pages/staff/RestaurantSignupPage'
import StaffLoginPage from './pages/staff/StaffLoginPage'
import SuperAdminDashboard from './pages/staff/SuperAdminDashboard'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StaffProvider>
        <CustomerProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />

                {/* Customer-facing: QR entry points */}
                <Route path="/r/:slug/t/:qrUuid" element={<TableEntryPage />} />
                <Route path="/r/:slug/order" element={<TakeawayEntryPage />} />
                <Route path="/reserve/:slug" element={<ReservationPage />} />
                <Route path="/order/:orderId/pay" element={<TakeawayPaymentPage />} />
                <Route path="/order/:orderId" element={<OrderStatusPage />} />

                {/* Staff */}
                <Route path="/signup" element={<RestaurantSignupPage />} />
                <Route path="/staff/login" element={<StaffLoginPage />} />
                <Route
                  path="/staff/chef"
                  element={
                    <RequireRole role="chef">
                      <ChefDashboard />
                    </RequireRole>
                  }
                />
                <Route
                  path="/staff/cashier"
                  element={
                    <RequireRole role="cashier">
                      <CashierDashboard />
                    </RequireRole>
                  }
                />
                <Route
                  path="/staff/employee"
                  element={
                    <RequireRole role="employee">
                      <EmployeeDashboard />
                    </RequireRole>
                  }
                />
                <Route
                  path="/staff/owner"
                  element={
                    <RequireRole role="owner">
                      <OwnerDashboard />
                    </RequireRole>
                  }
                />
                <Route
                  path="/staff/admin"
                  element={
                    <RequireRole role="super_admin">
                      <SuperAdminDashboard />
                    </RequireRole>
                  }
                />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </CustomerProvider>
      </StaffProvider>
    </QueryClientProvider>
  )
}
