import { requestStrategyData, type StrategyParam } from './helpers'

export function listAppAlarm(query: { beginTime: string; endTime: string; severity: string; pageSize: number; pageNum: number }) {
  const params: StrategyParam[] = [
    { name: 'startTs', value: query.beginTime },
    { name: 'endTs', value: query.endTime },
    { name: 'severity', value: query.severity },
    { name: 'pageSize', value: query.pageSize },
    { name: 'startRow', value: query.pageNum },
  ]
  return requestStrategyData(1920, params, 'json')
}
