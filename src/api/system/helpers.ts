import request from '@/utils/request'

export interface StrategyParam {
  name: string
  value: string | number
}

export interface StrategyResponse<T = any> {
  code: number
  data: T
  mesg?: string
}

export function requestStrategyData<T = any>(
  id: number,
  parameter: StrategyParam[],
  endpoint: 'data' | 'page' | 'json' = 'data'
): Promise<StrategyResponse<T>> {
  const urls = {
    data: '/api/PoininfoSmartValid/GetStrategyData',
    page: '/api/PoininfoSmartValid/GetPageStrategyData',
    json: '/api/PoininfoSmartValid/GetStrategyJsonData',
  }
  return request({
    url: urls[endpoint],
    method: 'post',
    data: { id, parameter },
  })
}

export function executeStrategy<T = any>(
  id: number,
  parameter: StrategyParam[]
): Promise<StrategyResponse<T>> {
  return request({
    url: '/api/PoininfoSmartValid/ExecuteStrategyCom',
    method: 'post',
    data: { id, parameter },
  })
}
