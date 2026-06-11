import { requestStrategyData, getMineName, type StrategyParam } from './helpers'

export function stationInfoList() {
  return requestStrategyData(3362, [{ name: 'MineName', value: getMineName() }])
}

export function stationInfoRightList(query: { pageNum: number; pageSize: number }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'StartRow', value: query.pageNum },
    { name: 'PageRowNums', value: query.pageSize },
  ]
  return requestStrategyData(3365, params, 'page')
}

export function stationChildrenList(query: { stationId: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'StationId', value: query.stationId },
  ]
  return requestStrategyData(3364, params)
}
