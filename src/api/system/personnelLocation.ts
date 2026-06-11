import { requestStrategyData, executeStrategy, type StrategyParam } from './helpers'

export { requestStrategyData, executeStrategy }

export function buildPaginationParams(page = 1, row = 20): StrategyParam[] {
  return [
    { name: 'Page', value: page },
    { name: 'Row', value: row },
  ]
}

export function getPolicy5285(type: string) {
  return requestStrategyData(5285, [{ name: 'Type', value: type }])
}

export function getIndexData(id: number, type: string, str: string) {
  return requestStrategyData(id, [
    { name: 'Type', value: type },
    { name: 'Str', value: str },
  ])
}

export function GetStrategyJsonData(id: number, parameter: StrategyParam[] | null) {
  return requestStrategyData(id, parameter || [], 'json')
}

export function GetStrategyData(id: number, parameter: StrategyParam[]) {
  return requestStrategyData(id, parameter, 'data')
}

export function getSelectData(strategyId: number, ...params: StrategyParam[]) {
  return requestStrategyData(strategyId, params)
}

export function getPolicy5303(id: number, params: StrategyParam[]) {
  return requestStrategyData(id, params)
}

export function getPolicy2572(id: number, params: StrategyParam[]) {
  return requestStrategyData(id, params, 'json')
}

export function ExecPolicy(id: number, params: StrategyParam[]) {
  return executeStrategy(id, params)
}

export { requestStrategyData as requestApi }
