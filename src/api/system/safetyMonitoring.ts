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
    { name: 'AlarmType', value: query.isCallThePolice || 0 },
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

/** 获取 KPI 统计数据（总点数、报警点数、模拟量、开关量等，策略 8453） */
export function getKpiData() {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
  ]
  return requestStrategyData(8453, params)
}

/** 获取分站详情（devLabel 含 F 时调用，策略 1964） */
export function substationInfo(devLabel: string) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DevLabel', value: devLabel },
  ]
  return requestStrategyData(1964, params)
}

/** 获取监测点详情（devLabel 不含 F 时调用，策略 1965） */
export function monitoringPointInfo(devLabel: string) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DevLabel', value: devLabel },
  ]
  return requestStrategyData(1965, params)
}
