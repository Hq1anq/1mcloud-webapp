import axiosInstance from '../lib/axios'
import type { FetchProxyListParams, ProxyListResponse } from '../types/proxy'

export async function fetchProxyList(
  params: FetchProxyListParams = {}
): Promise<ProxyListResponse> {
  const response = await axiosInstance.get<ProxyListResponse>('/server/list', {
    params: {
      proxy: 'true',
      page: params.page ?? 1,
      limit: params.limit ?? 200,
      by_status: params.by_status ?? '',
      by_time: params.by_time ?? 'all',
      by_created: params.by_created ?? '',
      ips: params.ips ?? '',
      keyword: params.keyword ?? '',
    },
  })
  return response.data
}
