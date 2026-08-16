import axiosInstance from '../lib/axios'
import type { FetchVpsListParams, VpsListResponse } from '../types/vps'

export async function fetchVpsList(
  params: FetchVpsListParams = {}
): Promise<VpsListResponse> {
  const response = await axiosInstance.get<VpsListResponse>('/server/list', {
    params: {
      proxy: 'false',
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
