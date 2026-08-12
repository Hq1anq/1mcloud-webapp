import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchProxyList } from '../api/proxyApi'
import type { FetchProxyListParams, ProxyListResponse } from '../types/proxy'

export const PROXY_QUERY_KEY = 'proxies'

export function useProxyListQuery(params: FetchProxyListParams = {}, enabled: boolean = true) {
  return useQuery<ProxyListResponse, Error>({
    queryKey: [PROXY_QUERY_KEY, params],
    queryFn: () => fetchProxyList(params),
    enabled,
    placeholderData: keepPreviousData,
  })
}
