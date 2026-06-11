import { requestStrategyData } from './helpers'

export function getData(mineName: string) {
  return requestStrategyData(1942, [{ name: 'MineName', value: mineName }])
}
