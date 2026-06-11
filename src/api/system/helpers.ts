import request from '@/utils/request'
import { getMineName as getCookieMineName } from '@/utils/cookie'

export interface StrategyParam {
  name: string
  value: string | number
}

export interface StrategyResponse<T = any> {
  code: number
  data: T
  mesg?: string
}

let _cachedMineName: string | null = null

/** 获取当前矿井名称（缓存，页面生命周期内不变） */
export function getMineName(): string {
  if (_cachedMineName === null) {
    _cachedMineName = getCookieMineName() || ''
  }
  return _cachedMineName
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
