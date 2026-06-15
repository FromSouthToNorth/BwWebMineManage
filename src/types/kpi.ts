export type KpiSemanticColor = 'primary' | 'danger' | 'warning' | 'success'

export interface KpiMeta {
  key: string
  label: string
  icon: string
  iconClass: string
  valueClass?: string
  color: KpiSemanticColor
  top?: boolean
}
