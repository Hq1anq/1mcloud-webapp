import axios from 'axios'
import useAuthStore from '../store/useAuthStore'

const axiosInstance = axios.create({
  baseURL: `/api`,
  timeout: 10000,
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
    const originalRequest = error.config

    // If 401 and not already retrying (to prevent infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry) useAuthStore.getState().logout()

    return Promise.reject(error)
  }
)

export default axiosInstance
