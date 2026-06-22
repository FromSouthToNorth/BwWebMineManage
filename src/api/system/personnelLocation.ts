import request from '@/utils/request'
import { requestStrategyData, executeStrategy, type StrategyParam } from './helpers'

export { requestStrategyData, executeStrategy }

export function buildPaginationParams(page = 1, row = 20): StrategyParam[] {
  return [
    { name: 'Page', value: page },
    { name: 'Row', value: row },
  ]
}

/** 获取当天和当前的下井人数 */
export function getPolicy5285(type: string) {
  return requestStrategyData(5285, [{ name: 'Type', value: type }])
}

/** 获取首页图表数据 */
export function getIndexData(id: number, type: string, str?: string) {
  const params: StrategyParam[] = [{ name: 'Type', value: type }]
  if (str != null) params.push({ name: 'Str', value: str })
  return requestStrategyData(id, params)
}

/** 井下人员信息非自定义查询 */
export function getpolicy5281(id: number, param: Record<string, any>, isPhone?: boolean) {
  return requestStrategyData(id, [
    { name: 'Type', value: param.type || '' },
    { name: 'Str', value: param.str || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 人员定位历史下井获取年份数据 */
export function getDownHoleLineData(id: number, MineName: string, year: number) {
  return requestStrategyData(id, [
    { name: 'MineName', value: MineName },
    { name: 'Year', value: year },
  ])
}

/** 获取每月下井统计数据 */
export function getDownHoleBarData(id: number, MineName: string, Year: number | string, Month: number | string) {
  return requestStrategyData(id, [
    { name: 'MineName', value: MineName },
    { name: 'Year', value: Year },
    { name: 'Month', value: Month },
  ])
}

/** 获取个人统计数据 */
export function getpersonalData(id: number, param: Record<string, any> = {}) {
  return requestStrategyData(id, [
    { name: 'UserRealName', value: param.UserRealName || '' },
    { name: 'WorkNumber', value: param.WorkNumber || '' },
    { name: 'SenderID', value: param.SenderID || '' },
    { name: 'Department', value: param.Department || '' },
    { name: 'Rank', value: param.Rank || '' },
    { name: 'WorkType', value: param.WorkType || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 获取月统计数据 */
export function getMonthCountData(id: number, param: Record<string, any> = {}) {
  return requestStrategyData(id, [
    { name: 'UserRealName', value: param.UserRealName || '' },
    { name: 'WorkNumber', value: param.WorkNumber || '' },
    { name: 'SenderID', value: param.SenderID || '' },
    { name: 'Department', value: param.Department || '' },
    { name: 'Rank', value: param.Rank || '' },
    { name: 'WorkType', value: param.WorkType || '' },
    { name: 'Year', value: param.Year || '' },
    { name: 'Month', value: param.Month || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ])
}

/** 分类统计 */
export function getClassifyCountData(id: number, param: Record<string, any> = {}) {
  return requestStrategyData(id, [
    { name: 'UserRealName', value: param.UserRealName || '' },
    { name: 'WorkNumber', value: param.WorkNumber || '' },
    { name: 'SenderID', value: param.SenderID || '' },
    { name: 'Department', value: param.Department || '' },
    { name: 'Rank', value: param.Rank || '' },
    { name: 'WorkType', value: param.WorkType || '' },
    { name: 'Year', value: param.Year || '' },
    { name: 'Month', value: param.Month || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 日统计 */
export function getDayCountData(id: number, param: Record<string, any> = {}) {
  return requestStrategyData(id, [
    { name: 'UserRealName', value: param.UserRealName || '' },
    { name: 'WorkNumber', value: param.WorkNumber || '' },
    { name: 'SenderID', value: param.SenderID || '' },
    { name: 'Department', value: param.Department || '' },
    { name: 'Rank', value: param.Rank || '' },
    { name: 'WorkType', value: param.WorkType || '' },
    { name: 'Day', value: param.date || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 获取人员出勤统计下拉框数据 */
export function getSelectData(id: number, type?: string) {
  return requestStrategyData(id, [
    { name: 'Type', value: type || '' },
  ], 'json')
}

/** 用户详情页面通用查询 */
export function getpolicy(id: number, params: Record<string, any>) {
  return requestStrategyData(id, [
    { name: 'WorkNumber', value: params.workNum || '' },
    { name: 'SenderID', value: params.SenderID || '' },
    { name: 'Year', value: params.year || '' },
    { name: 'Month', value: params.month || '' },
  ])
}

/** 获取下井信息（部门/职务/工种） */
export function getpolicy5264(id: number, params: Record<string, any>) {
  return requestStrategyData(id, [
    { name: 'Month', value: params.month || '' },
    { name: 'Day', value: params.day || '' },
    { name: 'Type', value: params.type || '' },
  ])
}

/** 获取出勤信息 */
export function getpolicy5266(id: number, params: Record<string, any>) {
  return requestStrategyData(id, [
    { name: 'Month', value: params.month || '' },
    { name: 'Day', value: params.day || '' },
    { name: 'Type', value: params.type || '' },
    { name: 'Str', value: params.name || '' },
  ])
}

/** 人员信息 */
export function getpolicy5339(id: number, SenderID: string) {
  return requestStrategyData(id, [{ name: 'SenderID', value: SenderID }])
}

/** 首页报警弹窗 */
export function indexTablePopup(id: number) {
  return requestStrategyData(id, [])
}

/** 报警弹窗下拉框 */
export function getPolicy5400(AlarmType?: string) {
  return requestStrategyData(5400, [
    { name: 'AlarmType', value: AlarmType || 'device' },
  ], 'json')
}

/** 人员历史报警详情 */
export function getPolicy5401(id: number, param: Record<string, any>) {
  return requestStrategyData(id, [
    { name: 'type', value: param.type || '' },
    { name: 'AlarmType', value: param.AlarmType || '' },
    { name: 'StartTime', value: param.StartTime || '' },
    { name: 'EndTime', value: param.EndTime || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
    { name: 'WorkNumber', value: param.WorkNumber || '' },
    { name: 'Number', value: param.Number || '' },
    { name: 'Name', value: param.Name || '' },
    { name: 'Remarks', value: param.Remarks || '' },
  ], 'json')
}

/** 人员轨迹信息 - 完整复刻原始项目业务逻辑 */
export function getpolicy5268(id: number, result: Record<string, any>) {
  // 深克隆 + 首字母大写转换（与原始 transitionKeyUp 一致）
  const obj = JSON.parse(JSON.stringify(result))
  const upResult: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    upResult[key[0].toUpperCase() + key.substring(1)] = obj[key]
  }

  // 格式化日期（原始使用 formatterDate / getCurrDateTime）
  const formatDt = (ts: any, fmt: string) => {
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return fmt
      .replace('yyyy', String(d.getFullYear()))
      .replace('MM', pad(d.getMonth() + 1))
      .replace('dd', pad(d.getDate()))
      .replace('HH', pad(d.getHours()))
      .replace('mm', pad(d.getMinutes()))
      .replace('ss', pad(d.getSeconds()))
  }
  const now = new Date()
  const getCurr = () => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  const param = {
    SenderId: upResult.SenderID,
    STime: formatDt(upResult.DownWellTime, 'yyyy-MM-dd HH:mm:ss'),
    ETime: !upResult.UpWellTime
      ? getCurr()
      : formatDt(upResult.UpWellTime, 'yyyy-MM-dd HH:mm:ss'),
    Page: result.Page == null ? 1 : result.Page,
    Row: result.Row == null ? 20 : result.Row,
  }

  return requestStrategyData(id, [
    { name: 'Senderid', value: param.SenderId },
    { name: 'STime', value: param.STime },
    { name: 'ETime', value: param.ETime },
    { name: 'Page', value: param.Page },
    { name: 'Row', value: param.Row },
  ], 'json')
}

/** 电源信息数据 */
export function getPolicy6726(param: Record<string, any>) {
  return requestStrategyData(6726, [
    { name: 'ShortDevLabel', value: param.ShortDevLabel || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 井下人员查询_自定义查询 */
export function getPolicy5280(id: number, param: Record<string, any>) {
  return requestStrategyData(id, [
    { name: 'UserRealName', value: param.UserRealName || '' },
    { name: 'WorkNumber', value: param.WorkNumber || '' },
    { name: 'SenderID', value: param.SenderID || '' },
    { name: 'Department', value: param.Department || '' },
    { name: 'Rank', value: param.Rank || '' },
    { name: 'WorkType', value: param.WorkType || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 设备状态 */
export function getPolicy5303(id: number, param: Record<string, any>) {
  return requestStrategyData(id, [
    { name: 'DeviceName', value: param.DeviceName || '' },
    { name: 'DeviceType', value: param.DeviceType || '' },
    { name: 'Area', value: param.Area || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 设备历史报警 */
export function getPolicy2572(id: number, param: Record<string, any>) {
  return requestStrategyData(id, [
    { name: 'DeviceName', value: param.DeviceName || '' },
    { name: 'StartTime', value: param.StartTime || '' },
    { name: 'EndTime', value: param.EndTime || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 人员撤离数据 */
export function getPolicy6748(param: Record<string, any>) {
  return requestStrategyData(6748, [
    { name: 'DeviceId', value: param.DeviceId || '' },
    { name: 'Page', value: param.Page || 1 },
    { name: 'Row', value: param.Row || 20 },
  ], 'json')
}

/** 人员定位通用 JSON 策略查询 */
export function GetStrategyJsonData(id: number, param: StrategyParam[] | null) {
  return requestStrategyData(id, param || [], 'json')
}

/** 人员定位通用策略数据查询 */
export function GetStrategyData(id: number, param: StrategyParam[]) {
  return requestStrategyData(id, param)
}

/** 执行策略 */
export function ExecPolicy(id: number, params: StrategyParam[]) {
  return executeStrategy(id, params)
}

/** 调用规则引擎接口 (bwPublic) */
export function bwPublicNodeRed(param: { api_id: string; data: any }) {
  return request.post('/bwPublic/SubmitAPI', {
    api_id: param.api_id,
    data: param.data,
  })
}

export { requestStrategyData as requestApi }
