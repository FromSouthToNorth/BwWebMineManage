import { requestStrategyData, type StrategyParam } from './helpers'

export function deiveceName(mineName = '骆驼山选煤厂') {
  return requestStrategyData(2382, [{ name: 'MineName', value: mineName }])
}

export function deiveceData(mineName = '骆驼山选煤厂') {
  return requestStrategyData(2383, [{ name: 'MineName', value: mineName }])
}

export function densityaData(sdtime1: string, sdtime2: string) {
  const params: StrategyParam[] = [
    { name: 'key', value: 'LTSXMC00300801112017375941,LTSXMC00300801081817135110' },
    { name: 'startTs', value: sdtime2 },
    { name: 'endTs', value: sdtime1 },
    { name: 'interval', value: 2000 },
    { name: 'agg', value: 'avg' },
  ]
  return requestStrategyData(4035, params, 'json')
}

export function densityaa2(sdtime1: string, sdtime2: string) {
  const params: StrategyParam[] = [
    { name: 'key', value: 'LTSXMC00300801081817135110' },
    { name: 'startTs', value: sdtime2 },
    { name: 'endTs', value: sdtime1 },
    { name: 'interval', value: 2000 },
    { name: 'agg', value: 'avg' },
  ]
  return requestStrategyData(4035, params, 'json')
}

export function getBushuiData(sdtime1: string, sdtime2: string) {
  const params: StrategyParam[] = [
    { name: 'key', value: 'LTSXMC00300801081816289424' },
    { name: 'startTs', value: sdtime2 },
    { name: 'endTs', value: sdtime1 },
    { name: 'interval', value: 2000 },
    { name: 'agg', value: 'avg' },
  ]
  return requestStrategyData(4035, params, 'json')
}

export function getBushuibData(sdtime1: string, sdtime2: string) {
  const params: StrategyParam[] = [
    { name: 'key', value: 'LTSXMC00300801081816289435' },
    { name: 'startTs', value: sdtime2 },
    { name: 'endTs', value: sdtime1 },
    { name: 'interval', value: 2000 },
    { name: 'agg', value: 'avg' },
  ]
  return requestStrategyData(4035, params, 'json')
}

export function getFenliuData(sdtime1: string, sdtime2: string) {
  const params: StrategyParam[] = [
    { name: 'key', value: 'LTSXMC00300801081816289457' },
    { name: 'startTs', value: sdtime2 },
    { name: 'endTs', value: sdtime1 },
    { name: 'interval', value: 2000 },
    { name: 'agg', value: 'avg' },
  ]
  return requestStrategyData(4035, params, 'json')
}

export function getFenliubData(sdtime1: string, sdtime2: string) {
  const params: StrategyParam[] = [
    { name: 'key', value: 'LTSXMC00300801081816289468' },
    { name: 'startTs', value: sdtime2 },
    { name: 'endTs', value: sdtime1 },
    { name: 'interval', value: 2000 },
    { name: 'agg', value: 'avg' },
  ]
  return requestStrategyData(4035, params, 'json')
}

export function getInstant(sdtime1: string, sdtime2: string) {
  const params: StrategyParam[] = [
    { name: 'key', value: 'LTSXMC00300801081817135110' },
    { name: 'startTs', value: sdtime2 },
    { name: 'endTs', value: sdtime1 },
    { name: 'interval', value: 2000 },
    { name: 'agg', value: 'avg' },
  ]
  return requestStrategyData(2249, params, 'json')
}

export function getInstantA(sdtime1: string, sdtime2: string) {
  const params: StrategyParam[] = [
    { name: 'key', value: 'LTSXMC00300801081817135110' },
    { name: 'startTs', value: sdtime2 },
    { name: 'endTs', value: sdtime1 },
    { name: 'interval', value: 480000 },
    { name: 'agg', value: 'avg' },
  ]
  return requestStrategyData(2249, params, 'json')
}
