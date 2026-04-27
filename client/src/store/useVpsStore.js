import { create } from 'zustand'
import axiosInstance from '../lib/axios'
import { extractIP, mergeVpsData } from '../lib/utils'
import useAuthStore from './useAuthStore'

const useVpsStore = create((set, get) => ({
  data: [],
  receivedData: [],
  renderingReceived: false,
  isLoading: false,

  // --- Core setters ---
  setIsLoading: (isLoading) => set({ isLoading }),
  setRenderingReceived: (renderingReceived) => set({ renderingReceived }),

  // Update a single row in both data and receivedData by sid
  updateRowBySid: (sid, updater) =>
    set((state) => ({
      data: state.data.map((r) => (r.sid === sid ? { ...r, ...updater(r) } : r)),
      receivedData: state.receivedData.map((r) => (r.sid === sid ? { ...r, ...updater(r) } : r)),
    })),

  // Reset view: reload receivedData from full data
  resetView: () =>
    set((state) => ({
      receivedData: [...state.data],
      renderingReceived: true,
    })),

  // --- DB sync ---
  syncToDb: async (rowsToSync) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated || !rowsToSync || rowsToSync.length === 0) return
    try {
      await axiosInstance.post('/vps', { vpsList: rowsToSync })
    } catch (err) {
      console.error('[DB Sync] Save failed:', err.message)
    }
  },

  deleteFromDb: async (sids) => {
    try {
      await axiosInstance.delete('/vps', { data: { sids } })
    } catch (err) {
      console.error('[Cleanup] Delete failed:', err.message)
    }
  },

  // Load from DB on mount
  // If DB is empty (first-time user), auto-fetch from /server/list
  loadFromDb: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) return

    set({ isLoading: true })
    try {
      const res = await axiosInstance.get('/vps')
      const dbData = res.data?.data || []

      if (dbData.length > 0) {
        set(() => ({
          data: dbData,
          receivedData: dbData,
          renderingReceived: true,
        }))
      } else {
        // First-time user — DB empty, auto-fetch from API
        try {
          const listRes = await axiosInstance.get('/server/list', {
            params: { proxy: 'false' },
          })
          const listData = listRes.data?.data || []
          if (listData.length > 0) {
            set(() => ({
              data: listData,
              receivedData: listData,
              renderingReceived: true,
            }))
            get().syncToDb(listData)
          }
        } catch (listErr) {
          console.error('[DB Sync] Initial fetch failed:', listErr.message)
        }
      }
    } catch (err) {
      console.error('[DB Sync] Load failed:', err.message)
    } finally {
      set({ isLoading: false })
    }
  },

  // --- Data fetch (replaces handleGetData's data portion) ---
  fetchData: async ({ ips = '', amount = '' } = {}) => {
    const parsedIps = ips
      .split('\n')
      .map((line) => extractIP(line))
      .filter(Boolean)
      .join(',')

    const params = { proxy: 'false' }
    if (parsedIps) params.ips = parsedIps
    params.amount = amount ? +amount : 200

    set({ isLoading: true })
    try {
      const res = await axiosInstance.get('/server/list', { params })
      const resData = res.data?.data || []

      // Merge resData into current state locally for rendering and syncing
      const localMerged = mergeVpsData(get().data, resData)
      const finalResData = localMerged.filter((row) => resData.some((r) => r.sid === row.sid))

      set((state) => {
        let mergedData = mergeVpsData(state.data, resData)

        // Trash data cleanup: if full fetch (no IPs) and returned results are within limit,
        // it means we got all current resources. Anything in prevData NOT in resData and NOT refunded is trash.
        let finalMergedData = mergedData
        if (!parsedIps && resData.length <= (params.amount || 200)) {
          const trashSids = state.data
            .filter(
              (row) =>
                !resData.some((r) => r.sid === row.sid) && row.status?.toLowerCase() !== 'refunded'
            )
            .map((row) => row.sid)

          if (trashSids.length > 0) {
            get().deleteFromDb(trashSids)
            finalMergedData = mergedData.filter((row) => !trashSids.includes(row.sid))
          }
        }

        return {
          data: finalMergedData,
          receivedData: finalResData,
          renderingReceived: true,
        }
      })

      // Sync updated data to DB in background
      get().syncToDb(finalResData)

      return finalResData
    } finally {
      set({ isLoading: false })
    }
  },

  // --- Buy success handler ---
  handleBuySuccess: (newData, extraConfig) => {
    if (Array.isArray(newData) && newData.length > 0) {
      const enrichedData = newData.map((item) => ({
        ...item,
        ...extraConfig,
      }))
      set((state) => ({
        data: mergeVpsData(state.data, enrichedData),
        receivedData: enrichedData,
        renderingReceived: true,
      }))
      get().syncToDb(enrichedData)
      return enrichedData
    }
    return null
  },
}))

export default useVpsStore
