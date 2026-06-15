import type { KpiMeta } from '@/types/kpi'

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
