import { requestStrategyData, type StrategyParam } from './helpers'
import { praseStrEmpty, praseStrZero, praseArrayStr } from '@/utils/util'

export interface SafetyMonitoringQuery {
  pageNum: number
  pageSize: number
  theme?: string
  mineName?: string
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
    { name: 'style', value: praseStrEmpty(query.theme) },
    { name: 'MineName', value: praseStrEmpty(query.mineName) },
    { name: 'AlarmType', value: praseStrZero(query.isCallThePolice) },
    { name: 'Station', value: praseStrZero(query.substation) },
    { name: 'DevType', value: praseStrZero(query.type) },
    { name: 'CategoryName', value: praseArrayStr(query.category ?? []) },
    { name: 'Area', value: praseStrEmpty(query.area) },
    { name: 'Address', value: praseStrEmpty(query.site) },
  ]
  return requestStrategyData(1954, params, 'page')
}

export function substationSelect(mineName: string) {
  return requestStrategyData(1938, [{ name: 'MineName', value: mineName }])
}

export function typeSelect(mineName: string) {
  return requestStrategyData(1940, [{ name: 'MineName', value: mineName }])
}

export function categorySelect(mineName: string) {
  return requestStrategyData(1947, [{ name: 'MineName', value: mineName }])
}

export function areaSelect(mineName: string) {
  return requestStrategyData(1961, [{ name: 'MineName', value: mineName }])
}

export function siteSelect(mineName: string) {
  return requestStrategyData(1964, [{ name: 'MineName', value: mineName }])
}

export function getSafetyMonitoringTotal(query: { mineName?: string; isCallThePolice?: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: praseStrEmpty(query.mineName) },
    { name: 'IsCallThePolice', value: praseStrZero(query.isCallThePolice) },
  ]
  return requestStrategyData(1965, params)
}
