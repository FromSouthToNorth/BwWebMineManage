import { requestStrategyData, type StrategyParam } from './helpers'

export function installNameSelect(mineName: string) {
  return requestStrategyData(1989, [{ name: 'MineName', value: mineName }])
}

export function listMinePressure(query: {
  mineName: string
  installSiteName: string
  pageNum: number
  pageSize: number
  type: string
}) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'AreaName', value: query.installSiteName },
    { name: 'StartRow', value: query.pageNum },
    { name: 'PageRowNums', value: query.pageSize },
    { name: 'type', value: query.type },
  ]
  return requestStrategyData(1990, params, 'page')
}

export function getAlarmValue(installSiteName: string) {
  return requestStrategyData(1991, [{ name: 'AreaName', value: installSiteName }])
}

export function getDyna(mineName: string) {
  return requestStrategyData(2591, [{ name: 'MineName', value: mineName }])
}

export function getHistoryData(query: { mineName: string; type: string; areaName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'type', value: query.type },
    { name: 'AreaName', value: query.areaName },
  ]
  return requestStrategyData(1992, params)
}
