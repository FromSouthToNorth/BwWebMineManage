import { requestStrategyData, getMineName, type StrategyParam } from './helpers'

export function deiveceClassSelect() {
  return requestStrategyData(1978, [{ name: 'MineName', value: getMineName() }])
}

export function deiviceNameSelect(query: { deiviceClassfy: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceClassfy', value: query.deiviceClassfy },
  ]
  return requestStrategyData(1979, params)
}

export function maxTime(query: { deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(1980, params)
}

export function annularChartData(query: { deiviceName: string; countDate: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ]
  return requestStrategyData(1981, params)
}

export function Yesterdaysdata(query: { deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(1982, params)
}

export function Todaysdata(query: { deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(1983, params)
}

export function yearsYieldContrast(query: { deiviceName: string; countDate: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ]
  return requestStrategyData(1984, params)
}

export function everydayYield(query: { deiviceName: string; countDate: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ]
  return requestStrategyData(2592, params)
}

export function recentYearsData(query: { deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(3230, params)
}

export function instantFlow(query: { deiviceClassfy: string; deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceClassfy', value: query.deiviceClassfy },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(3231, params)
}
