import { requestStrategyData, getMineName, type StrategyParam } from './helpers'
import { praseStrEmpty, praseStrZero } from '@/utils/util'

export interface SafetyMonitoringQuery {
  pageNum: number
  pageSize: number
  theme?: string
  isCallThePolice?: string
  substation?: string
  type?: string
  category?: string[]
  area?: string
  site?: string
}

export function listSafetyMonitoring(query: SafetyMonitoringQuery) {
  const params: StrategyParam[] = [
    { name: 'StartRow', value: query.pageNum },
    { name: 'PageRowNums', value: query.pageSize },
    { name: 'style', value: query.theme || 'theme-dark' },
    { name: 'MineName', value: getMineName() },
    { name: 'AlarmType', value: praseStrZero(query.isCallThePolice) },
    { name: 'Station', value: praseStrZero(query.substation) },
    { name: 'DevType', value: praseStrZero(query.type) },
    {
      name: 'CategoryName', value: query.category?.join(',') || 0
    },
    { name: 'Area', value: praseStrEmpty(query.area) },
    { name: 'Address', value: praseStrEmpty(query.site) },
  ]
  return requestStrategyData(1954, params, 'page')
}

export function substationSelect() {
  return requestStrategyData(1938, [{ name: 'MineName', value: getMineName() }])
}

export function typeSelect() {
  return requestStrategyData(1940, [{ name: 'MineName', value: getMineName() }])
}

export function categorySelect() {
  return requestStrategyData(1947, [{ name: 'MineName', value: getMineName() }])
}

export function areaSelect() {
  return requestStrategyData(1961, [{ name: 'MineName', value: getMineName() }])
}

export function siteSelect() {
  return requestStrategyData(1964, [{ name: 'MineName', value: getMineName() }])
}

export function getSafetyMonitoringTotal(query: { isCallThePolice?: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'IsCallThePolice', value: praseStrZero(query.isCallThePolice) },
  ]
  return requestStrategyData(1965, params)
}
