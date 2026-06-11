import { requestStrategyData, getMineName } from './helpers'

export function getData() {
  return requestStrategyData(1942, [{ name: 'MineName', value: getMineName() }])
}
