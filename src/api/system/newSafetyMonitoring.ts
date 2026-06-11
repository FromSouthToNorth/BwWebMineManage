import { requestStrategyData, type StrategyParam } from './helpers'

export function stationInfoList(mineName: string) {
  return requestStrategyData(3362, [{ name: 'MineName', value: mineName }])
}

export function stationInfoRightList(query: { mineName: string; pageNum: number; pageSize: number }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'StartRow', value: query.pageNum },
    { name: 'PageRowNums', value: query.pageSize },
  ]
  return requestStrategyData(3365, params, 'page')
}

export function stationChildrenList(query: { mineName: string; stationId: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'StationId', value: query.stationId },
  ]
  return requestStrategyData(3364, params)
}
