/**
 * personnel_location 图表初始化工具函数
 * 从 D:\bw\Bw.WebMineManage 原始项目移植，适配 Vue 3 + Pinia
 *
 * 注意：本模块使用模块级变量管理图表实例（myChartLine / myChartBar），
 * 同一时间每种图表类型只能存在一个实例，适合单图表页面场景。
 */
import { getDownHoleLineData, getDownHoleBarData } from '@/api/system/personnelLocation'
import { getMineName } from '@/api/system/helpers'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import router from '@/router'
import { getCssVar, createLinearGradient, isLightTheme } from '@/composables/useECharts'

// ============================================
// 类型定义
// ============================================

interface MonthItem {
  k: number
  v: string
}

interface YearData {
  years: Array<{ value: number; name: number }>
  year: number
  month: number
  day: number
}

interface LineData {
  lineXData: string[]
  lineYData: number[]
}

interface RouteInfo {
  path?: string
  param?: Record<string, any>
}

// ============================================
// 常量
// ============================================

/** 月份中文名称映射 */
const MONTH_NAMES: MonthItem[] = [
  { k: 1, v: '一月' }, { k: 2, v: '二月' }, { k: 3, v: '三月' },
  { k: 4, v: '四月' }, { k: 5, v: '五月' }, { k: 6, v: '六月' },
  { k: 7, v: '七月' }, { k: 8, v: '八月' }, { k: 9, v: '九月' },
  { k: 10, v: '十月' }, { k: 11, v: '十一月' }, { k: 12, v: '十二月' },
]

/** 堆叠柱状图配色（已按渲染顺序排列） */
const STACKED_BAR_COLORS: string[] = [
  'rgba(12, 88, 133, 1)', 'rgba(12, 66, 120, 1)',
  'rgba(48, 131, 157, 1)', 'rgba(27, 174, 134, 1)',
  'rgba(121, 207, 89, 1)', '#E4FF3E',
  'rgba(149, 209, 155, 1)', 'rgba(126, 219, 208, 1)',
]

/** 柱状图渐变色（与 composable 共享 createLinearGradient） */
const BAR_GRADIENT = createLinearGradient(0, 0, 0, 1, [
  { offset: 0, color: 'rgba(0, 201, 189, 1)' },
  { offset: 1, color: 'rgba(17, 124, 184, 1)' },
])

// ============================================
// 模块级状态
// ============================================

let myChartLine: ECharts | null = null
let myChartBar: ECharts | null = null
let _resizeGuard = false

// ============================================
// 内部工具函数
// ============================================

/** 检查 DOM 元素是否有有效尺寸（ECharts 渲染的前置条件） */
function isValidChartContainer(el: HTMLElement | null): boolean {
  if (!el) return false
  const w = el.clientWidth || el.offsetWidth
  const h = el.clientHeight || el.offsetHeight
  return w > 0 && h > 0
}

/** 注册全局 resize 监听器（只注册一次），统一处理所有图表实例 */
function ensureGlobalResize(): void {
  if (_resizeGuard) return
  _resizeGuard = true
  window.addEventListener('resize', () => {
    myChartLine?.resize()
    myChartBar?.resize()
  })
}

/** 安全释放折线图实例 */
function disposeLineChart(): void {
  if (myChartLine != null) {
    myChartLine.dispose()
    myChartLine = null
  }
}

/** 安全释放柱状图实例 */
function disposeBarChart(): void {
  if (myChartBar != null) {
    myChartBar.dispose()
    myChartBar = null
  }
}

// ============================================
// 图表选项工厂
// ============================================

/** 创建通用的轴触发 tooltip 格式化函数 */
function createAxisTooltipFormatter(unit: string): (params: any[]) => string {
  return (params: any[]) => {
    let result = params[0].axisValueLabel + '<br>'
    params.forEach((item: any) => {
      if (item.value) {
        result += item.marker + `${unit} : ${item.value}</br>`
      }
    })
    return result
  }
}

/** 创建标准工具箱配置 */
function createDefaultToolbox(showToolBox: boolean = true) {
  return {
    show: showToolBox,
    top: 0,
    feature: {
      dataZoom: { yAxisIndex: 'none' },
      dataView: { readOnly: false },
      restore: {},
      saveAsImage: {},
    },
    iconStyle: { borderWidth: 2 },
  }
}

/** 创建柱状图通用 click 处理器 */
function createBarClickHandler(
  that: any,
  routeInfo?: RouteInfo,
): (params: any) => void {
  return (params: any) => {
    if (routeInfo?.path) {
      const { path, param } = routeInfo
      if (!param) return
      if (path === 'downholepersonNum' || path === 'downholeNum_app') {
        param.day = params.name.substring(0, params.name.length - 1)
        param.total = params.data
      }
      else if (path === 'turnOutInfo' || path === 'turnOutInfo_app') {
        param.name = params.name
      }
      router.push({ name: path, params: param })
    }
    else {
      that.barclick(params.name)
    }
  }
}

/** 创建堆叠柱状图通用 click 处理器（与普通柱状图的 data 结构不同） */
function createStackedBarClickHandler(
  that: any,
  routeInfo?: RouteInfo,
): (params: any) => void {
  return (params: any) => {
    if (routeInfo?.path) {
      const { path, param } = routeInfo
      if (!param) return
      if (path === 'downholepersonNum' || path === 'downholeNum_app') {
        param.day = params.name
        param.total = params.data.value
      }
      else if (path === 'turnOutInfo') {
        param.name = params.name
      }
      router.push({ name: path, params: param })
    }
    else {
      that.barclick(params.name)
    }
  }
}

// ============================================
// 导出工具函数
// ============================================

/* 获取年份及年月日信息 */
export function getYear(): YearData {
  const date = new Date()
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const data: YearData = { years: [], year: y, month: m, day: d }
  for (let i = 0; i <= 2; i++) {
    data.years.unshift({ value: y - i, name: y - i })
  }
  data.years.reverse()
  data.year = data.years[0].value
  data.month = m
  data.day = d
  return data
}

/** 对象属性转首字母大写（不修改原对象） */
export function transitionKeyUp<T extends Record<string, any>>(item: T): Record<string, any> {
  const result: Record<string, any> = { ...item }
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const allKey = key[0].toUpperCase() + key.substring(1)
      result[allKey] = result[key]
      if (allKey !== key) delete result[key]
    }
  }
  return result
}

/** 数组内所有对象属性转首字母大写 */
export function upperJSONKey(arr: any[]): Record<string, any>[] {
  return arr.map((item) => transitionKeyUp(item))
}

/** 分页组件返回字段 → 策略分页字段 */
export function pageFieldConvert(result: { currentPage: number; pageSize: number }): { Page: number; Row: number } {
  return { Page: result.currentPage, Row: result.pageSize }
}

// ============================================
// 数据获取
// ============================================

/** 获取月度折线图数据（数字月 → 中文月份标签） */
export async function getLineData(val: MonthItem[], year: number | string): Promise<LineData> {
  const datas: LineData = { lineXData: [], lineYData: [] }
  const { data } = await getDownHoleLineData(5260, getMineName(), year)
  if (data != null && data.length !== 0) {
    data.forEach((item: any, index: number) => {
      datas.lineXData.push(item.month === val[index]?.k ? val[index].v : item.month)
      datas.lineYData.push(item.num)
    })
  }
  return datas
}

// ============================================
// 图表初始化 — 折线图
// ============================================

/** 初始化单数据源折线图（点击月份触发回调更新柱状图） */
export function GetinitLine(
  that: any,
  charBox: HTMLElement | null,
  unit: string,
  ShowToolBox?: boolean,
): void {
  disposeLineChart()
  if (!isValidChartContainer(charBox)) return
  ensureGlobalResize()

  myChartLine = echarts.init(charBox!)
  const option = {
    color: {
      type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: '#00B2BF' },
        { offset: 1, color: '#00B2BF00' },
      ],
      global: false,
    },
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { axis: 'x', color: 'rgba(245, 255, 133, 1)' },
      formatter: (params: any) => {
        let result = params[0].axisValueLabel + '<br>'
        params.forEach(function (item: any) {
          if (item.value) result += item.marker + `${unit} : ` + item.value + '</br>'
        })
        that.chartsCurrentData = params[0]
        return result
      },
    },
    toolbox: createDefaultToolbox(ShowToolBox),
    grid: { left: 50, top: 20, bottom: 40, right: 30 },
    xAxis: {
      type: 'category',
      data: that.lineXData,
      axisLabel: { show: true, color: getCssVar('--text-color') },
    },
    yAxis: {
      type: 'value',
      axisLabel: { show: true, color: getCssVar('--text-color') },
      splitLine: {
        lineStyle: { type: 'dashed', color: isLightTheme() ? '#d5d6d8' : 'rgba(0, 178, 191, 0.2)' },
        show: true,
      },
    },
    series: [{
      data: that.lineYData, type: 'line', areaStyle: {},
      symbol: 'emptyCircle', symbolSize: 10,
      label: { show: true, color: getCssVar('--text-color') },
      lineStyle: { color: 'rgba(0, 178, 191, 1)' },
    }],
  }

  myChartLine.setOption(option)
  myChartLine.off('click')
  myChartLine.getZr().on('click', (params: any) => {
    const chickData = that.chartsCurrentData
    const pointInPixel = [params.offsetX, params.offsetY]
    if (myChartLine!.containPixel('grid', pointInPixel)) {
      const data = { name: chickData.name, value: chickData.value, color: chickData.color }
      MONTH_NAMES.forEach((item) => {
        if (data.name === item.v) { that.month = item.k; that.getBarData() }
      })
    }
  })
}

/** 初始化多数据源折线图（正常/超时/全部三条线） */
export function GetinitLines(
  that: any,
  charBox: HTMLElement | null,
  unit: string,
  ShowToolBox?: boolean,
): void {
  disposeLineChart()
  ensureGlobalResize()

  myChartLine = echarts.init(charBox!)
  const option = {
    tooltip: { trigger: 'axis' as const },
    toolbox: {
      show: ShowToolBox === undefined ? true : ShowToolBox, top: 15,
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: {},
      },
      iconStyle: { borderWidth: 2 },
    },
    color: ['rgba(0, 191, 53, 1)', 'rgba(255, 77, 20, 1)', 'rgba(0, 178, 191, 1)'],
    legend: {
      data: ['正常', '超时', '全部'],
      textStyle: { color: isLightTheme() ? '#000000' : '#fff' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: false, data: that.lineXData,
      axisLabel: { show: true, color: getCssVar('--text-color') },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: getCssVar('--text-color') },
        show: true,
      },
    },
    series: [
      {
        name: '正常', type: 'line', data: that.lineYDataNormal,
        label: { show: true, position: 'top', color: getCssVar('--text-color') },
        lineStyle: { color: 'rgba(0, 178, 191, 1)' },
      },
      {
        label: { show: true, position: 'top', color: getCssVar('--text-color') },
        name: '超时', type: 'line', stack: 'Total', data: that.lineYDataTimeOut,
      },
      {
        label: { show: true, position: 'top', color: getCssVar('--text-color') },
        name: '全部', type: 'line', stack: 'Total', data: that.lineYDataAll,
      },
    ],
  }
  myChartLine.setOption(option)
  myChartLine.off('click')
  myChartLine.getZr().on('click', (params: any) => {
    const pointInPixel = [params.offsetX, params.offsetY]
    if (myChartLine!.containPixel('grid', pointInPixel)) {
      const pointInGrid = myChartLine!.convertFromPixel({ seriesIndex: 0 }, pointInPixel)
      const xIndex = Number(pointInGrid[0])
      const month = ((myChartLine!.getOption()) as any).xAxis[0].data[xIndex]
      const M = month.substring(0, month.indexOf('月'))
      that.params.month = M
      that.month = M
      that.getpolyc5286()
    }
  })
}

// ============================================
// 图表初始化 — 柱状图
// ============================================

/** 初始化带滚动缩放滑条的柱状图 */
export function getinitBarZoom(that: any, chartBox: HTMLElement | null, unit: string): void {
  disposeBarChart()
  if (!isValidChartContainer(chartBox)) return
  ensureGlobalResize()

  myChartBar = echarts.init(chartBox!)
  const isLargeData = that.barYData.length >= 100
  const option = {
    color: BAR_GRADIENT,
    toolbox: createDefaultToolbox(),
    tooltip: {
      trigger: 'axis',
      formatter: createAxisTooltipFormatter(unit),
      axisPointer: { type: 'shadow' },
    },
    dataZoom: [
      {
        type: 'slider', show: true,
        backgroundColor: 'rgb(19, 63, 100)', fillerColor: 'rgb(16, 171, 198)',
        borderColor: 'rgb(19, 63, 100)', showDetail: true,
        start: 0, end: isLargeData ? 5 : 30,
        filterMode: 'empty', width: '50%', height: 5, left: 'center',
        zoomLoxk: true, handleSize: 0, bottom: 3,
      },
      {
        type: 'inside', zoomOnMouseWheel: false, moveOnMouseMove: true, moveOnMouseWheel: true,
      },
    ],
    grid: { left: 0, bottom: 10, top: 20, right: 0, height: 'auto', width: 'auto', containLabel: true },
    xAxis: {
      type: 'category', data: that.barXData,
      splitLine: { show: false },
      axisLabel: { color: getCssVar('--text-color') },
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { type: "dashed" as const, color: "rgba(0, 178, 191, 0.2)" } },
      axisLabel: { color: getCssVar('--text-color') },
    },
    series: [{
      sort: 'descending', data: that.barYData, type: 'bar',
      showBackground: false,
      backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' },
      barWidth: '20%',
    }],
  }
  if (!isLargeData) delete (option as any).dataZoom
  myChartBar.setOption(option)
}

/** 初始化柱状图（PC，带点击导航回调） */
export function getinitBar(
  that: any,
  chartBox: HTMLElement | null,
  unit: string,
  routeInfo: RouteInfo,
  showToolBox?: boolean,
): void {
  disposeBarChart()
  if (!isValidChartContainer(chartBox)) return
  ensureGlobalResize()

  myChartBar = echarts.init(chartBox!)
  const option = {
    color: BAR_GRADIENT,
    toolbox: createDefaultToolbox(showToolBox),
    tooltip: {
      trigger: 'axis',
      formatter: createAxisTooltipFormatter(unit),
      axisPointer: { type: 'shadow' },
    },
    grid: { left: 0, bottom: 0, top: 20, right: 0, height: 'auto', width: 'auto', containLabel: true },
    xAxis: {
      type: 'category', data: that.barXData,
      label: { show: false },
      splitLine: { show: false },
      axisLabel: { color: getCssVar('--text-color'), interval: 0, rotate: 40 },
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { type: 'dashed', color: getCssVar('--chartDashedColor') } },
      axisLabel: { color: getCssVar('--text-color') },
    },
    series: [{
      sort: 'descending', data: that.barYData, type: 'bar',
      showBackground: false,
      label: { show: true, position: 'top', color: getCssVar('--text-color') },
    }],
  }
  myChartBar.setOption(option)
  myChartBar.off('click')
  myChartBar.on('click', createBarClickHandler(that, routeInfo))
}

/** 初始化堆叠柱状图（PC，班次分组） */
export function stackbar(
  that: any,
  chartBox: HTMLElement | null,
  unit: string,
  routeInfo: RouteInfo,
  ShowToolBox?: boolean,
): void {
  disposeBarChart()
  if (!isValidChartContainer(chartBox)) return
  ensureGlobalResize()

  myChartBar = echarts.init(chartBox!)
  const xAxisData = new Set()
  const legend = new Set()
  const series: any[] = []
  let day = ''

  that.data.forEach((item: any) => {
    day = Number(item.day.substring(item.day.lastIndexOf('-') + 1))
    xAxisData.add(day + '号')
    legend.add(item.shiftName)
  })
  const days = Array.from(xAxisData) as string[]
  const legends = Array.from(legend).sort((a: any, b: any) => a - b)

  legends.forEach((item: any, index: number) => {
    series.push({
      label: {
        show: true, position: 'inside', verticalAlign: 'middle', align: 'center',
        formatter: '{c}', color: getCssVar('--text-color'),
      },
      name: item, type: 'bar', stack: '班次',
      emphasis: { focus: 'series' },
      data: [],
      itemStyle: { color: item === '' ? '' : STACKED_BAR_COLORS[index] },
    })
  })

  const option: any = {
    color: BAR_GRADIENT,
    grid: { left: 10, right: 10, bottom: '15', top: 20, containLabel: true },
    tooltip: { trigger: 'item' },
    toolbox: createDefaultToolbox(ShowToolBox),
    legend: {
      itemWidth: 15, itemHeight: 15, data: legends,
      textStyle: { color: getCssVar('--text-color') },
    },
    xAxis: {
      data: days, splitLine: { show: false },
      axisLabel: {
        show: true,
        color: getCssVar('--text-color'),
      },
    },
    yAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: isLightTheme() ? '#d5d6d8' : 'rgba(0, 178, 191, 0.2)',
        },
      },
      axisLabel: { color: getCssVar('--text-color') },
    },
    series,
  }

  legends.forEach((legendName: any, index: number) => {
    that.data.forEach((obj: any) => {
      if (legendName === obj.shiftName) {
        option.series[index].data.push({
          name: Number(obj.day.substring(obj.day.lastIndexOf('-') + 1)),
          value: obj.num,
        })
      }
    })
  })

  myChartBar.setOption(option)
  myChartBar.off('click')
  myChartBar.on('click', createStackedBarClickHandler(that, routeInfo))
}

// ============================================
// 图表初始化 — 柱状图（App 移动端）
// ============================================

/** 初始化柱状图（App 移动端，带分页切片） */
export function getinitBar_app(
  that: any,
  chartBox: HTMLElement | null,
  unit: string,
  routeInfo: RouteInfo,
): void {
  disposeBarChart()
  if (!isValidChartContainer(chartBox)) return
  ensureGlobalResize()

  myChartBar = echarts.init(chartBox!)
  const start = (that.page - 1) * that.size
  const end = that.page * that.size
  const option: any = {
    color: BAR_GRADIENT,
    tooltip: {
      trigger: 'axis',
      formatter: createAxisTooltipFormatter(unit),
      axisPointer: { type: 'shadow' },
    },
    grid: { left: 40, top: 5, containLabel: true },
    xAxis: { type: 'value', splitLine: { show: false }, show: false },
    yAxis: {
      type: 'category', inverse: true,
      axisTick: { show: false },
      axisLine: { show: false, lineStyle: { color: isLightTheme() ? 'rgb(237 240 249 / 100%)' : '#0a1820' } },
      axisLabel: { show: false, color: getCssVar('--text-color') },
      max: that.size,
      data: that.barXData.slice(start, end),
    },
    series: [{
      name: '人数', type: 'bar', data: that.barYData.slice(start, end), barWidth: '80%',
      label: {
        show: true, formatter: '{b}', position: 'left', align: 'left', offset: [10, 0],
        color: getCssVar('--text-color'), fontSize: 12,
      },
      barCateGoryGap: '0%',
    }],
  }
  myChartBar.setOption(option)
  myChartBar.off('click')
  myChartBar.on('click', createBarClickHandler(that, routeInfo))
}

/** 初始化堆叠柱状图（App 移动端，带分页切片） */
export function stackbar_app(
  that: any,
  chartBox: HTMLElement | null,
  unit: string,
  routeInfo: RouteInfo,
  ShowToolBox?: boolean,
): void {
  disposeBarChart()
  if (!isValidChartContainer(chartBox)) return
  ensureGlobalResize()

  myChartBar = echarts.init(chartBox!)
  const start = (that.page - 1) * that.size
  const end = that.page * that.size
  const xAxisData = new Set()
  const legend = new Set()
  const series: any[] = []
  let day = ''

  that.data.forEach((item: any) => {
    day = Number(item.day.substring(item.day.lastIndexOf('-') + 1))
    xAxisData.add(day + '号')
    legend.add(item.shiftName)
  })
  const days = Array.from(xAxisData) as string[]
  const legends = Array.from(legend).sort((a: any, b: any) => a - b)

  legends.forEach((item: any, index: number) => {
    series.push({
      label: {
        show: true, position: 'inside', verticalAlign: 'middle', align: 'center',
        formatter: '{c}', color: getCssVar('--text-color'),
      },
      name: item, type: 'bar', stack: '班次',
      emphasis: { focus: 'series' },
      data: [],
      itemStyle: { color: item === '' ? '' : STACKED_BAR_COLORS[index] },
    })
  })

  that.total = days.length % that.size === 0
    ? days.length / that.size
    : Math.ceil(days.length / that.size)

  const option: any = {
    color: BAR_GRADIENT,
    grid: { left: 20, right: 0, bottom: '15', top: 40, containLabel: true },
    tooltip: { trigger: 'item' },
    toolbox: {
      show: ShowToolBox === undefined ? true : ShowToolBox, bottom: 5, left: 'right',
      feature: { dataView: { readOnly: false }, saveAsImage: {} },
      iconStyle: { borderWidth: 2 },
    },
    legend: {
      itemWidth: 15, itemHeight: 15, data: legends, icon: 'circle', itemHeight: 6, left: 'center',
      textStyle: { color: getCssVar('--text-color'), fontSize: 10 },
    },
    xAxis: { show: false, splitLine: { show: false } },
    yAxis: { splitLine: { show: false }, data: days.slice(start, end) },
    series,
  }

  legends.forEach((legendName: any, index: number) => {
    that.data.forEach((obj: any) => {
      if (legendName === obj.shiftName) {
        option.series[index].data.push({
          name: Number(obj.day.substring(obj.day.lastIndexOf('-') + 1)),
          value: obj.num,
        })
      }
    })
  })

  option.series.forEach((item: any) => { item.data = item.data.slice(start, end) })
  myChartBar.setOption(option)
  myChartBar.off('click')
  myChartBar.on('click', createStackedBarClickHandler(that, routeInfo))
}
