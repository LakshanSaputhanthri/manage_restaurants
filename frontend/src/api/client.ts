import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? 'ws://127.0.0.1:8000'

const CUSTOMER_TOKEN_KEY = 'customer_access_token'
const STAFF_ACCESS_KEY = 'staff_access_token'
const STAFF_REFRESH_KEY = 'staff_refresh_token'

export const customerTokenStore = {
  get: () => localStorage.getItem(CUSTOMER_TOKEN_KEY),
  set: (token: string) => localStorage.setItem(CUSTOMER_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(CUSTOMER_TOKEN_KEY),
}

export const staffTokenStore = {
  getAccess: () => localStorage.getItem(STAFF_ACCESS_KEY),
  getRefresh: () => localStorage.getItem(STAFF_REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(STAFF_ACCESS_KEY, access)
    localStorage.setItem(STAFF_REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(STAFF_ACCESS_KEY)
    localStorage.removeItem(STAFF_REFRESH_KEY)
  },
}

// Customer-facing requests: table/menu browsing, cart checkout, order tracking.
export const customerApi = axios.create({ baseURL: API_BASE_URL })
customerApi.interceptors.request.use((config) => {
  const token = customerTokenStore.get()
  if (token) config.headers['X-Customer-Token'] = token
  return config
})

// Staff dashboards: kept on a separate instance/localStorage keys so a
// customer session and a staff session can never bleed into each other.
export const staffApi = axios.create({ baseURL: API_BASE_URL })
staffApi.interceptors.request.use((config) => {
  const token = staffTokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

staffApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && staffTokenStore.getRefresh()) {
      original._retry = true
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/staff/refresh/`, {
          refresh: staffTokenStore.getRefresh(),
        })
        staffTokenStore.set(data.access, staffTokenStore.getRefresh() as string)
        original.headers.Authorization = `Bearer ${data.access}`
        return staffApi(original)
      } catch {
        staffTokenStore.clear()
      }
    }
    return Promise.reject(error)
  },
)

// Fully public, unauthenticated requests (restaurant registration, public menu).
export const publicApi = axios.create({ baseURL: API_BASE_URL })
