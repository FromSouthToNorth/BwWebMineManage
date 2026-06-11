import { requestStrategyData, getMineName, type StrategyParam } from './helpers'

export function installNameSelect() {
  return requestStrategyData(1989, [{ name: 'MineName', value: getMineName() }])
}

export function listMinePressure(query: {
  installSiteName: string
  pageNum: number
  pageSize: number
  type: string
}) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
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

export function getDyna() {
  return requestStrategyData(2591, [{ name: 'MineName', value: getMineName() }])
}

export function getHistoryData(query: { type: string; areaName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'type', value: query.type },
    { name: 'AreaName', value: query.areaName },
  ]
  return requestStrategyData(1992, params)
}
