import type { KpiMeta } from '@/types/kpi'

// ============================================================
// AQ6201-2019 §5.6.12.3 分级报警级别
// ============================================================
export interface AlarmLevel {
  level: number
  label: string
  shortLabel: string
  color: 'success' | 'warning' | 'danger'
  priority: number
  desc: string
  animation: 'none' | 'pulse' | 'flash'
}

export const ALARM_LEVELS: Record<string, AlarmLevel> = {
  LEVEL_0: { level: 0, label: '正常', shortLabel: '正常', color: 'success', priority: 0, desc: '传感器工作正常', animation: 'none' },
  LEVEL_1: { level: 1, label: '一级预警', shortLabel: '预警', color: 'warning', priority: 1, desc: '浓度接近报警门限（≥80%门限）', animation: 'pulse' },
  LEVEL_2: { level: 2, label: '二级报警', shortLabel: '报警', color: 'danger', priority: 2, desc: '浓度超限，需立即处理', animation: 'pulse' },
  LEVEL_3: { level: 3, label: '三级紧急', shortLabel: '紧急', color: 'danger', priority: 3, desc: '浓度超限且快速升高', animation: 'flash' },
  LEVEL_4: { level: 4, label: '突出危险', shortLabel: '突出', color: 'danger', priority: 4, desc: '煤与瓦斯突出风险', animation: 'flash' },
}

export const ALARM_LEVEL_LIST: AlarmLevel[] = Object.values(ALARM_LEVELS)

/**
 * 根据传感器监测值判断报警级别
 * @param value 当前监测值
 * @param alarmThreshold 报警门限
 * @param cutoffThreshold 断电门限
 * @param changeRate 变化率（可选）
 */
export function determineAlarmLevel(
  value: number,
  alarmThreshold?: number,
  cutoffThreshold?: number,
  changeRate?: number,
): AlarmLevel {
  // 无效值视为正常
  if (value == null || Number.isNaN(value)) return ALARM_LEVELS.LEVEL_0

  const alarmTh = alarmThreshold ?? Infinity
  const cutoffTh = cutoffThreshold ?? Infinity
  const effectiveAlarm = Math.min(alarmTh, cutoffTh)

  // 未达报警门限 → 正常
  if (value < effectiveAlarm) return ALARM_LEVELS.LEVEL_0

  // 达到报警门限但未达断电门限
  if (value >= alarmTh && value < cutoffTh) {
    return ALARM_LEVELS.LEVEL_1
  }

  // 达到断电门限
  if (changeRate && changeRate > 0.1) {
    // 快速升高 → 三级紧急
    return ALARM_LEVELS.LEVEL_3
  }

  return ALARM_LEVELS.LEVEL_2
}

// ============================================================
// 传感器类型与单位映射（AQ1029-2019 表1 + 各类传感器定义）
// ============================================================
export const SENSOR_UNITS: Record<string, string> = {
  '甲烷': '%CH₄',
  '瓦斯': '%CH₄',
  '一氧化碳': '%CO',
  '二氧化碳': '%CO₂',
  '氧气': '%O₂',
  '风速': 'm/s',
  '风压': 'Pa',
  '温度': '℃',
  '烟雾': 'μg/m³',
  '粉尘': 'mg/m³',
  '流量': 'm³/min',
  '压力': 'MPa',
  '液位': 'm',
  '电压': 'V',
  '电流': 'A',
  '开停': '',
  '馈电': '',
  '风门': '',
  '风筒': '',
  '风向': '',
}

/**
 * 根据传感器类型名推测单位
 */
export function guessSensorUnit(categoryName?: string): string {
  if (!categoryName) return ''
  for (const [key, unit] of Object.entries(SENSOR_UNITS)) {
    if (categoryName.includes(key)) return unit
  }
  return ''
}

// ============================================================
// KPI 常量
// ============================================================
export const KPI_LIST: KpiMeta[] = [
  {
    key: 'total',
    label: '监测总数',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    iconClass: 'kpi-total',
    color: 'primary',
    top: true,
  },
  {
    key: 'alarmPoint',
    label: '报警',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    iconClass: 'kpi-alarm',
    valueClass: 'kpi-danger',
    color: 'danger',
    top: true,
  },
  {
    key: 'analog',
    label: '模拟量',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    iconClass: 'kpi-ok',
    color: 'success',
  },
  {
    key: 'switch',
    label: '开关量',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    iconClass: 'kpi-total',
    color: 'primary',
  },
  {
    key: 'substation',
    label: '分站',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="6" width="4" height="4"/><rect x="14" y="6" width="4" height="4"/><rect x="6" y="14" width="4" height="4"/><rect x="14" y="14" width="4" height="4"/></svg>',
    iconClass: 'kpi-warn',
    color: 'warning',
  },
  {
    key: 'other',
    label: '其他',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
    iconClass: 'kpi-total',
    color: 'primary',
  },
  {
    key: 'devicesNeedCalibration',
    label: '需标校',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    iconClass: 'kpi-warn',
    valueClass: 'kpi-warning',
    color: 'warning',
    top: true,
  },
]

export const KPI_CONFIG: Record<string, KpiMeta> = Object.fromEntries(
  KPI_LIST.map(item => [item.key, item]),
)

/** 顶部 KPI 栏需要展示的 key 顺序 */
export const TOP_KPI_KEYS = KPI_LIST.filter(item => item.top).map(item => item.key)
