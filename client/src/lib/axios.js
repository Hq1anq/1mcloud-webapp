import axios from 'axios'
import useAuthStore from '../store/useAuthStore'
import { decryptServerRows, encryptClientRows } from '../utils/crypto'

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL || ''}/api`,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from Zustand store
    const token = useAuthStore.getState().token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // Set custom timeout for specific endpoints
    if (config.url?.endsWith('/server/create') || config.url?.includes('/vps/support')) {
      config.timeout = 60000 // 60 seconds
    }

    // Encrypt outgoing sensitive payload if present
    if (config.data && typeof config.data === 'object') {
      if (Array.isArray(config.data.vpsList)) {
        config.data.vpsList = await encryptClientRows(config.data.vpsList)
      }
      if (Array.isArray(config.data.proxies)) {
        config.data.proxies = await encryptClientRows(config.data.proxies)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  async (response) => {
    // Decrypt incoming sensitive payload if present
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.data)) {
        response.data.data = await decryptServerRows(response.data.data)
      } else if (Array.isArray(response.data.servers)) {
        response.data.servers = await decryptServerRows(response.data.servers)
      }
    }

    return response
  },
  (error) => {
    // If 401 Unauthorized, automatically log out
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
