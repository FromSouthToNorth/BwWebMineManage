import { shallowRef, type Ref } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, LinearGradientObject } from 'echarts'

/** ECharts 暗色主题配色 */
export const DARK_CHART_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
]

/** 判断用户是否偏好减少动画 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 读取 CSS 变量值 */
export function getCssVar(name: string, fallback = ''): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** 创建线性渐变 */
export function createLinearGradient(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  colors: { offset: number; color: string }[],
): LinearGradientObject {
  return new echarts.graphic.LinearGradient(x0, y0, x1, y1, colors)
}

/** 按索引读取图表配色 CSS 变量 */
export function chartColor(index: number): string {
  return getCssVar(`--chart-${(index % 8) + 1}`)
}

/** 暗色主题全局选项（合并到 chart.setOption 中） */
export function darkChartTheme(): EChartsOption {
  const reduced = prefersReducedMotion()
  return {
    backgroundColor: 'transparent',
    color: DARK_CHART_COLORS,
    animation: !reduced,
    animationDuration: reduced ? 0 : 800,
    animationEasing: 'cubicOut',
    animationDurationUpdate: reduced ? 0 : 300,
    grid: {
      top: 24,
      bottom: 28,
      left: 44,
      right: 16,
      containLabel: true,
    },
    textStyle: {
      color: '#94a3b8',
      fontSize: 11,
    },
    title: {
      textStyle: {
        color: '#f0f2f5',
        fontSize: 14,
        fontWeight: 600,
      },
    },
    legend: {
      textStyle: { color: '#94a3b8', fontSize: 11 },
      pageTextStyle: { color: '#94a3b8' },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderColor: 'rgba(148, 163, 184, 0.15)',
      borderWidth: 1,
      textStyle: {
        color: '#f0f2f5',
        fontSize: 12,
      },
      extraCssText: 'backdrop-filter: blur(8px); border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);',
    },
    xAxis: {
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.15)' } },
      axisTick: { lineStyle: { color: 'rgba(148, 163, 184, 0.15)' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.06)', type: 'dashed' } },
    },
    /* ECharts 5.6+ series 级联样式通过具体 series 设置 */
  } as EChartsOption
}

/**
 * 组合式函数：管理 ECharts 实例生命周期
 * - 自动使用暗色主题
 * - 自动 resize
 * - 自动 dispose
 */
export function useECharts(chartRef: Ref<HTMLDivElement | undefined>) {
  const chart = shallowRef<echarts.ECharts | null>(null)

  function init() {
    if (!chartRef.value) return
    chart.value = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
    return chart.value
  }

  function setOption(option: EChartsOption) {
    if (!chart.value) return
    chart.value.setOption(option, { notMerge: true })
  }

  function resize() {
    chart.value?.resize()
  }

  function dispose() {
    chart.value?.dispose()
    chart.value = null
  }

  return { chart, init, setOption, resize, dispose }
}
