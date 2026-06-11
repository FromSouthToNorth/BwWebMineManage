import { requestStrategyData, getMineName, type StrategyParam } from './helpers'

export function listEalTimeAlarm() {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'StartRow', value: 1 },
    { name: 'PageRowNums', value: 10 },
  ]
  return requestStrategyData(1960, params, 'page')
}

export function listMoreEalTimeAlarm(query: { pageNum: number; pageSize: number }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'StartRow', value: query.pageNum },
    { name: 'PageRowNums', value: query.pageSize },
  ]
  return requestStrategyData(1960, params, 'page')
}

export function listHistoricalAlarm(query: { pageNum: number; pageSize: number; address: string; typeName: string; category: string; startTime: string; endTime: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'StartRow', value: query.pageNum },
    { name: 'PageRowNums', value: query.pageSize },
    { name: 'Address', value: query.address },
    { name: 'DevType', value: query.typeName },
    { name: 'CategoryName', value: query.category },
    { name: 'startTime', value: query.startTime },
    { name: 'endTime', value: query.endTime },
  ]
  return requestStrategyData(1963, params, 'page')
}
