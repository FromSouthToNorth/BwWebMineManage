import { requestStrategyData, type StrategyParam } from './helpers'

export function deiveceClassSelect(mineName: string) {
  return requestStrategyData(1978, [{ name: 'MineName', value: mineName }])
}

export function deiviceNameSelect(query: { mineName: string; deiviceClassfy: string }) {
  return requestStrategyData(1979, [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceClassfy', value: query.deiviceClassfy },
  ])
}

export function maxTime(query: { mineName: string; deiviceName: string }) {
  return requestStrategyData(1980, [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
  ])
}

export function getAnnularData(query: { mineName: string; deiviceName: string; countDate: string }) {
  return requestStrategyData(1981, [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ])
}

export function yesterdayData(query: { mineName: string; deiviceName: string }) {
  return requestStrategyData(1982, [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
  ])
}

export function todayData(query: { mineName: string; deiviceName: string }) {
  return requestStrategyData(1983, [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
  ])
}

export function beltSelect() {
  return requestStrategyData(2704, [{ name: 'MineName', value: '骆驼山选煤厂' }])
}

export function omnData(mineName: string) {
  return requestStrategyData(2702, [{ name: 'MineName', value: mineName }])
}

export function omnData2(mineName: string) {
  return requestStrategyData(3229, [{ name: 'MineName', value: mineName }])
}

export function yearsYieldContrast(query: { mineName: string; deiviceName: string; countDate: string }) {
  return requestStrategyData(1984, [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ])
}

export function everydayYield(query: { mineName: string; deiviceName: string; countDate: string }) {
  return requestStrategyData(2592, [
    { name: 'MineName', value: query.mineName },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ])
}
