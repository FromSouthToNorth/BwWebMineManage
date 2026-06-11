import { requestStrategyData, getMineName, type StrategyParam } from './helpers'

export function deiveceClassSelect() {
  return requestStrategyData(1978, [{ name: 'MineName', value: getMineName() }])
}

export function deiviceNameSelect(query: { deiviceClassfy: string }) {
  return requestStrategyData(1979, [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceClassfy', value: query.deiviceClassfy },
  ])
}

export function maxTime(query: { deiviceName: string }) {
  return requestStrategyData(1980, [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
  ])
}

export function getAnnularData(query: { deiviceName: string; countDate: string }) {
  return requestStrategyData(1981, [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ])
}

export function yesterdayData(query: { deiviceName: string }) {
  return requestStrategyData(1982, [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
  ])
}

export function todayData(query: { deiviceName: string }) {
  return requestStrategyData(1983, [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
  ])
}

export function beltSelect() {
  return requestStrategyData(2704, [{ name: 'MineName', value: '骆驼山选煤厂' }])
}

export function omnData() {
  return requestStrategyData(2702, [{ name: 'MineName', value: getMineName() }])
}

export function omnData2() {
  return requestStrategyData(3229, [{ name: 'MineName', value: getMineName() }])
}

export function yearsYieldContrast(query: { deiviceName: string; countDate: string }) {
  return requestStrategyData(1984, [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ])
}

export function everydayYield(query: { deiviceName: string; countDate: string }) {
  return requestStrategyData(2592, [
    { name: 'MineName', value: getMineName() },
    { name: 'DeiviceName', value: query.deiviceName },
    { name: 'CountDate', value: query.countDate },
  ])
}
