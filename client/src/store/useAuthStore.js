import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosInstance from '../lib/axios'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axiosInstance.post('/auth/login', {
            email,
            password,
          })

          const { success, token, user, error } = response.data

          if (success && token) {
            set({
              token,
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return true
          } else {
            console.error('Login failed:', error)
            set({
              isLoading: false,
              error: error || 'Login failed',
              isAuthenticated: false,
            })
            return false
          }
        } catch (err) {
          console.error('Login error:', err)
          const errorMessage = err.response?.data?.error || 'Internal Server Error'
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      // Helper to check if token exists and is valid (basic check)
      checkAuth: () => {
        const token = get().token
        if (token) {
          set({ isAuthenticated: true })
        } else {
          set({ isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // only persist these fields
    }
  )
)

export default useAuthStore
