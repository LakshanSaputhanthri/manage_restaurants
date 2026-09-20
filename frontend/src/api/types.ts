export type StaffRole = 'super_admin' | 'owner' | 'chef' | 'cashier' | 'employee'

export interface StaffUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: StaffRole
  restaurant: number | null
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  has_account: boolean
  access_token: string
}

export type RestaurantStatus = 'pending' | 'active' | 'suspended'

export interface Restaurant {
  id: number
  name: string
  slug: string
  status: RestaurantStatus
  address: string
  phone: string
  logo: string | null
  owner_username?: string
}

export interface Table {
  id: number
  number: string
  capacity: number
  qr_uuid: string
  status: 'available' | 'occupied' | 'reserved'
}

export interface MenuItem {
  id: number
  category: number | null
  name: string
  description: string
  price: string
  image: string | null
  is_available?: boolean
}

export interface Category {
  id: number
  name: string
  sort_order: number
  items?: MenuItem[]
}

export type OrderType = 'dine_in' | 'takeaway'

export type OrderStatus =
  | 'awaiting_payment'
  | 'payment_verifying'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'picked_up'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  id: number
  menu_item: number | null
  item_name: string
  unit_price: string
  quantity: number
  notes: string
}

export interface Order {
  id: string
  restaurant: number
  order_type: OrderType
  table: number | null
  table_number: string | null
  status: OrderStatus
  total_amount: string
  notes: string
  items: OrderItem[]
  customer_name: string
  customer_phone: string
  payment_status: string | null
  payment_method: string | null
  created_at: string
  updated_at: string
}

export type PaymentMethod = 'cash' | 'online_stub' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'verified' | 'rejected'

export interface Payment {
  id: number
  order_id: string
  restaurant_id: number
  method: PaymentMethod
  status: PaymentStatus
  amount: string
  slip_image: string | null
  verified_at: string | null
  rejection_reason: string
  created_at: string
}

export interface Reservation {
  id: number
  restaurant: number
  table: number | null
  date: string
  time: string
  party_size: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes: string
  customer_name: string
  customer_phone: string
}

export interface CartLine {
  menu_item_id: number
  name: string
  price: string
  quantity: number
  notes?: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
