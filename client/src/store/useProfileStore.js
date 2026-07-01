import { create } from 'zustand'
import axiosInstance from '../lib/axios'

function getCachedBalance() {
  try {
    const cached = localStorage.getItem('account-profile')
    if (!cached) return null
    const parsed = JSON.parse(cached)
    return parsed?.amount ?? null
  } catch {
    return null
  }
}

const useProfileStore = create((set) => ({
  balance: getCachedBalance(),

  fetchBalance: async () => {
    try {
      const res = await axiosInstance.get('/user/profile')
      if (res.data?.success) {
        const amount = res.data.user?.amount ?? null
        set({ balance: amount })
        // Keep localStorage in sync (AccountPage reads from it too)
        try {
          const cached = localStorage.getItem('account-profile')
          const prev = cached ? JSON.parse(cached) : {}
          localStorage.setItem('account-profile', JSON.stringify({ ...prev, amount }))
        } catch { /* ignore */ }
      }
    } catch { /* silently fail */ }
  },

  clearBalance: () => set({ balance: null }),
}))

export default useProfileStore
