import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchVpsList } from '../api/vpsApi'
import type { FetchVpsListParams, VpsListResponse } from '../types/vps'

export const VPS_QUERY_KEY = 'vps'

export function useVpsListQuery(params: FetchVpsListParams = {}, enabled: boolean = true) {
  return useQuery<VpsListResponse, Error>({
    queryKey: [VPS_QUERY_KEY, params],
    queryFn: () => fetchVpsList(params),
    enabled,
    placeholderData: keepPreviousData,
  })
}
