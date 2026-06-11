import { requestStrategyData, type StrategyParam } from './helpers'

export function deiveceClassSelect(mineName: string) {
  return requestStrategyData(1978, [{ name: 'MineName', value: mineName }])
}

export function deiviceNameSelect(query: { mineName: string; deiviceClassfy: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceClassfy', value: query.deiviceClassfy },
  ]
  return requestStrategyData(1979, params)
}

export function maxTime(query: { mineName: string; deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(1980, params)
}

export function annularChartData(query: { mineName: string; deiviceName: string; countDate: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ]
  return requestStrategyData(1981, params)
}

export function Yesterdaysdata(query: { mineName: string; deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(1982, params)
}

export function Todaysdata(query: { mineName: string; deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(1983, params)
}

export function yearsYieldContrast(query: { mineName: string; deiviceName: string; countDate: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ]
  return requestStrategyData(1984, params)
}

export function everydayYield(query: { mineName: string; deiviceName: string; countDate: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ]
  return requestStrategyData(2592, params)
}

export function recentYearsData(query: { mineName: string; deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(3230, params)
}

export function instantFlow(query: { mineName: string; deiviceClassfy: string; deiviceName: string }) {
  const params: StrategyParam[] = [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceClassfy', value: query.deiviceClassfy },
    { name: 'DeiviceName', value: query.deiviceName },
  ]
  return requestStrategyData(3231, params)
}
