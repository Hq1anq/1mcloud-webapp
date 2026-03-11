import axios from 'axios'
import useAuthStore from '../store/useAuthStore'

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL || ''}/api`,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from Zustand store
    const token = useAuthStore.getState().token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, automatically log out
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
