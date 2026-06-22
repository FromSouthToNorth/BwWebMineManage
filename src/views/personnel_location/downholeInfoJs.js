/**
 * personnel_location 图表初始化工具函数
 * 从 D:\bw\Bw.WebMineManage 原始项目移植，适配 Vue 3 + Pinia
 */
import { getDownHoleLineData, getDownHoleBarData } from '@/api/system/personnelLocation'
import { getMineName } from '@/api/system/helpers'
import * as echarts from 'echarts'
import router from '@/router'

const DATA_THEME = 'data-theme'

/** 检查 DOM 元素是否有有效尺寸（ECharts 渲染的前提条件） */
function isValidChartContainer(el) {
  if (!el) return false
  const w = el.clientWidth || el.offsetWidth
  const h = el.clientHeight || el.offsetHeight
  return w > 0 && h > 0
}
let myChartLine, myChartBar
let str = [
  { k: 1, v: '一月' }, { k: 2, v: '二月' }, { k: 3, v: '三月' },
  { k: 4, v: '四月' }, { k: 5, v: '五月' }, { k: 6, v: '六月' },
  { k: 7, v: '七月' }, { k: 8, v: '八月' }, { k: 9, v: '九月' },
  { k: 10, v: '十月' }, { k: 11, v: '十一月' }, { k: 12, v: '十二月' },
]

const rootElement = document.documentElement
const ComputedStyle = getComputedStyle(rootElement)

/* 获取年份 */
export function getYear() {
  let date = new Date()
  let y = date.getFullYear()
  let m = date.getMonth() + 1
  let d = date.getDate()
  let data = { years: [], year: '', month: '', day: '' }
  for (let i = 0; i <= 2; i++) {
    data.years.unshift({ value: y - i, name: y - i })
  }
  data.years.reverse()
  data.year = data.years[0].value
  data.month = m
  data.day = d
  return data
}

/* 获取默认时间 */
export function getInitDate(numOfDays) {
  let date = new Date()
  date.setDate(date.getDate() - numOfDays)
  let year1 = date.getFullYear()
  let month1 = date.getMonth() + 1
  let day1 = date.getDate()
  let StartTime = `${year1}-${month1 < 10 ? '0' + month1 : month1}-${day1 < 10 ? '0' + day1 : day1}`
  date = new Date()
  date.setDate(date.getDate() + 1)
  let year2 = date.getFullYear()
  let month2 = date.getMonth() + 1
  let day2 = date.getDate()
  let EndTime = `${year2}-${month2 < 10 ? '0' + month2 : month2}-${day2 < 10 ? '0' + day2 : day2}`
  return { StartTime, EndTime }
}

function getTheme() {
  return localStorage.getItem(DATA_THEME) == 'light'
}

/* 获取当前时间 */
export function getCurrDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/** 格式化时间 */
export function formatterDate(timestamps, fmt) {
  let date = new Date(timestamps)
  let str = fmt
  str = str.replace('yyyy', date.getFullYear())
  str = str.replace('MM', formatNum(date.getMonth() + 1))
  str = str.replace('dd', formatNum(date.getDate()))
  str = str.replace('HH', formatNum(date.getHours()))
  str = str.replace('mm', formatNum(date.getMinutes()))
  str = str.replace('ss', formatNum(date.getSeconds()))
  str = str.replace('sss', formatMilliseconds(date.getMilliseconds()))
  return str
}

function formatNum(arg0) {
  let str = arg0.toString()
  return str.length == 1 ? '0' + str : str
}

function formatMilliseconds(arg) {
  var str = arg.toString()
  if (str.length == 1) return '00' + str
  else if (str.length == 2) return '0' + str
  else if (str.length == 3) return str
}

/** 对象属性转首字母大写（不修改原对象） */
export const transitionKeyUp = (item) => {
  const result = { ...item }
  for (var key in result) {
    const firstString = key[0].toUpperCase()
    const leftKey = key.substring(1)
    const allKey = firstString + leftKey
    result[allKey] = result[key]
    if (allKey != key) delete result[key]
  }
  return result
}

export const upperJSONKey = (arr) => {
  let upArr = []
  arr.forEach((item) => upArr.push(transitionKeyUp(item)))
  return upArr
}

/** 数字月转中文月份 */
export async function getLineData(val, year) {
  const str = val
  let datas = { lineXData: [], lineYData: [] }
  const { data } = await getDownHoleLineData(5260, getMineName(), year)
  if (data != null && data.length != 0) {
    data.forEach((item, index) => {
      datas.lineXData.push(item.month == str[index].k ? str[index].v : item.month)
      datas.lineYData.push(item.num)
    })
  }
  return datas
}

/** 分页组件返回字段转策略分页字段 */
export function pageFieldConvert(result) {
  return { Page: result.currentPage, Row: result.pageSize }
}

/** 初始化折线图 */
export function GetinitLine(that, charBox, unit, ShowToolBox) {
  if (myChartLine) myChartLine.dispose()
  if (!isValidChartContainer(charBox)) return
  window.addEventListener('resize', () => { myChartLine.resize() })

  let chartDom = charBox
  myChartLine = echarts.init(chartDom)
  let option = {
    color: {
      type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: '#00B2BF' },
        { offset: 1, color: '#00B2BF00' },
      ],
      global: false,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { axis: 'x', color: 'rgba(245, 255, 133, 1)' },
      formatter: (params) => {
        var result = params[0].axisValueLabel + '<br>'
        params.forEach(function (item) {
          if (item.value) result += item.marker + `${unit} : ` + item.value + '</br>'
        })
        that.chartsCurrentData = params[0]
        return result
      },
    },
    toolbox: {
      show: ShowToolBox == undefined ? true : ShowToolBox,
      top: 0,
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: {},
      },
      iconStyle: { borderWidth: 2 },
    },
    grid: { left: 50, top: 20, bottom: 40, right: 30 },
    xAxis: {
      type: 'category',
      data: that.lineXData,
      axisLabel: { show: true, color: ComputedStyle.getPropertyValue('--text-color') },
    },
    yAxis: {
      type: 'value',
      axisLabel: { show: true, color: ComputedStyle.getPropertyValue('--text-color') },
      splitLine: {
        lineStyle: { type: 'dashed', color: getTheme() ? '#d5d6d8' : 'rgba(0, 178, 191, 0.2)' },
        show: true,
      },
    },
    series: [{
      data: that.lineYData, type: 'line', areaStyle: {},
      symbol: 'emptyCircle', symbolSize: 10,
      label: { show: true, color: ComputedStyle.getPropertyValue('--text-color') },
      lineStyle: { color: 'rgba(0, 178, 191, 1)' },
    }],
  }

  myChartLine.setOption(option)
  myChartLine.off('click')
  myChartLine.getZr().on('click', (params) => {
    const chickData = that.chartsCurrentData
    const pointInPixel = [params.offsetX, params.offsetY]
    if (myChartLine.containPixel('grid', pointInPixel)) {
      let data = { name: chickData.name, value: chickData.value, color: chickData.color }
      that.str.forEach((item) => {
        if (data.name === item.v) { that.month = item.k; that.getBarData() }
      })
    }
  })
}

/** 初始化折线图多数据源 */
export function GetinitLines(that, charBox, unit, ShowToolBox) {
  if (myChartLine) myChartLine.dispose()
  window.addEventListener('resize', () => { myChartLine.resize() })
  let dom = charBox
  myChartLine = echarts.init(dom)
  let option = {
    tooltip: { trigger: 'axis' },
    toolbox: {
      show: ShowToolBox == undefined ? true : ShowToolBox, top: 15,
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
      textStyle: { color: getTheme() ? '#000000' : '#fff' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: false, data: that.lineXData,
      axisLabel: {
        show: true, formatter: function (value, index) { return value },
        color: ComputedStyle.getPropertyValue('--text-color'),
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: ComputedStyle.getPropertyValue('--text-color') },
        show: true,
      },
    },
    series: [
      {
        name: '正常', type: 'line', data: that.lineYDataNormal,
        label: { show: true, position: 'top', color: ComputedStyle.getPropertyValue('--text-color') },
        lineStyle: { color: 'rgba(0, 178, 191, 1)' },
      },
      {
        label: { show: true, position: 'top', color: ComputedStyle.getPropertyValue('--text-color') },
        name: '超时', type: 'line', stack: 'Total', data: that.lineYDataTimeOut,
      },
      {
        label: { show: true, position: 'top', color: ComputedStyle.getPropertyValue('--text-color') },
        name: '全部', type: 'line', stack: 'Total', data: that.lineYDataAll,
      },
    ],
  }
  myChartLine.setOption(option)
  myChartLine.off('click')
  myChartLine.getZr().on('click', (params) => {
    let pointInPixel = [params.offsetX, params.offsetY]
    if (myChartLine.containPixel('grid', pointInPixel)) {
      let pointInGrid = myChartLine.convertFromPixel({ seriesIndex: 0 }, pointInPixel)
      let xIndex = pointInGrid[0]
      let handleIndex = Number(xIndex)
      var op = myChartLine.getOption()
      var month = op.xAxis[0].data[handleIndex]
      let M = month.substring(0, month.indexOf('月'))
      that.params.month = M
      that.month = M
      that.getpolyc5286()
    }
  })
}

/** 初始化柱状图滚动数据 */
export function getinitBarZoom(that, chartBox, unit) {
  if (myChartBar != null && myChartBar != '' && myChartBar != undefined) myChartBar.dispose()
  if (!isValidChartContainer(chartBox)) return
  window.addEventListener('resize', () => { myChartBar.resize() })
  let chartDom = chartBox
  myChartBar = echarts.init(chartDom)
  let option = {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(0, 201, 189, 1)' },
      { offset: 1, color: 'rgba(17, 124, 184, 1)' },
    ]),
    toolbox: {
      show: true, top: 0,
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: {},
      },
      iconStyle: { borderWidth: 2 },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        var result = params[0].axisValueLabel + '<br>'
        params.forEach(function (item) {
          if (item.value) result += item.marker + `${unit} : ` + item.value + '</br>'
        })
        return result
      },
      axisPointer: { type: 'shadow' },
    },
    dataZoom: [
      {
        type: 'slider', show: true,
        backgroundColor: 'rgb(19, 63, 100)', fillerColor: 'rgb(16, 171, 198)',
        borderColor: 'rgb(19, 63, 100)', showDetail: true,
        start: 0, end: that.barYData.length >= 100 ? 5 : 30,
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
      axisLabel: { color: ComputedStyle.getPropertyValue('--text-color') },
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { type: 'dashed', color: 'rgba(0, 178, 191, 0.2)' } },
      axisLabel: { color: ComputedStyle.getPropertyValue('--text-color') },
    },
    series: [{
      sort: 'descending', data: that.barYData, type: 'bar',
      showBackground: false,
      backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' },
      barWidth: '20%',
    }],
  }
  if (that.barXData.length <= 100) delete option.dataZoom
  myChartBar.setOption(option)
}

/** 初始化柱状图 */
export function getinitBar(that, chartBox, unit, routeInfo, width, showToolBox) {
  if (myChartBar != null && myChartBar != '' && myChartBar != undefined) myChartBar.dispose()
  if (!isValidChartContainer(chartBox)) return
  window.addEventListener('resize', () => { myChartBar.resize() })
  let chartDom = chartBox
  myChartBar = echarts.init(chartDom)
  let option = {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(0, 201, 189, 1)' },
      { offset: 1, color: 'rgba(17, 124, 184, 1)' },
    ]),
    toolbox: {
      show: showToolBox == undefined ? true : showToolBox, top: 0,
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: {},
      },
      iconStyle: { borderWidth: 2 },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        var result = params[0].axisValueLabel + '<br>'
        params.forEach(function (item) {
          if (item.value) result += item.marker + `${unit} :` + item.value + '</br>'
        })
        return result
      },
      axisPointer: { type: 'shadow' },
    },
    grid: { left: 0, bottom: 0, top: 20, right: 0, height: 'auto', width: 'auto', containLabel: true },
    xAxis: {
      type: 'category', data: that.barXData,
      label: { show: false },
      splitLine: { show: false },
      axisLabel: { color: ComputedStyle.getPropertyValue('--text-color'), interval: 0, rotate: 40 },
    },
    yAxis: {
      type: 'value',
      splitLine: { show: true, lineStyle: { type: 'dashed', color: ComputedStyle.getPropertyValue('--chartDashedColor') } },
      axisLabel: { color: ComputedStyle.getPropertyValue('--text-color') },
    },
    series: [{
      sort: 'descending', data: that.barYData, type: 'bar',
      showBackground: false,
      label: { show: true, position: 'top', color: ComputedStyle.getPropertyValue('--text-color') },
    }],
  }
  myChartBar.setOption(option)
  myChartBar.off('click')
  myChartBar.on('click', (params) => {
    if (routeInfo.path) {
      if (routeInfo.path == 'downholepersonNum') {
        routeInfo.param.day = params.name.substring(0, params.name.length - 1)
        routeInfo.param.total = params.data
      } else if (routeInfo.path == 'turnOutInfo') {
        routeInfo.param.name = params.name
      }
      router.push({ name: routeInfo.path, params: routeInfo.param })
    } else {
      that.barclick(params.name)
    }
  })
}

/** 堆叠柱状图 */
export function stackbar(that, chartBox, unit, routeInfo, ShowToolBox) {
  if (myChartBar != null && myChartBar != '' && myChartBar != undefined) myChartBar.dispose()
  if (!isValidChartContainer(chartBox)) return
  window.addEventListener('resize', () => { myChartBar.resize() })
  let chartDom = chartBox
  myChartBar = echarts.init(chartDom)
  let xAxisData = new Set()
  let legend = new Set()
  let series = []
  let day = ''
  let colors = [
    'rgba(126, 219, 208, 1)', 'rgba(149, 209, 155, 1)', '#E4FF3E',
    'rgba(121, 207, 89, 1)', 'rgba(27, 174, 134, 1)', 'rgba(48, 131, 157, 1)',
    'rgba(12, 88, 133, 1)', 'rgba(12, 66, 120, 1)',
  ]
  colors = colors.reverse()
  that.data.forEach((item) => {
    day = Number(item.day.substring(item.day.lastIndexOf('-') + 1))
    xAxisData.add(day + '号')
    legend.add(item.shiftName)
  })
  let days = Array.from(xAxisData)
  let legends = Array.from(legend).sort(function (a, b) { return a - b })
  legends.forEach((item, index) => {
    series.push({
      label: {
        show: true, position: 'inside', verticalAlign: 'middle', align: 'center',
        formatter: '{c}', color: ComputedStyle.getPropertyValue('--text-color'),
      },
      name: item, type: 'bar', stack: '班次',
      emphasis: { focus: 'series' },
      data: [],
      itemStyle: { color: item == '' ? '' : colors[index] },
    })
  })
  let option = {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(0, 201, 189, 1)' },
      { offset: 1, color: 'rgba(17, 124, 184, 1)' },
    ]),
    grid: { left: 10, right: 10, bottom: '15', top: 20, containLabel: true },
    tooltip: { trigger: 'item' },
    toolbox: {
      show: ShowToolBox == undefined ? true : ShowToolBox, top: 0,
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: { backgroundColor: '#1d2d3d' },
      },
      iconStyle: { borderWidth: 2 },
    },
    legend: { itemWidth: 15, itemHeight: 15, data: legends, textStyle: { color: ComputedStyle.getPropertyValue('--text-color') } },
    xAxis: {
      data: days, splitLine: { show: false },
      axisLabel: { show: true, formatter: function (value, index) { return value }, color: ComputedStyle.getPropertyValue('--text-color') },
    },
    yAxis: {
      splitLine: { show: true, lineStyle: { type: 'dashed', color: getTheme() ? '#d5d6d8' : 'rgba(0, 178, 191, 0.2)' } },
      axisLabel: { color: ComputedStyle.getPropertyValue('--text-color') },
    },
    series: series,
  }
  legends.forEach((legend, index) => {
    that.data.forEach((obj) => {
      if (legend == obj.shiftName) {
        option.series[index].data.push({ name: Number(obj.day.substring(obj.day.lastIndexOf('-') + 1)), value: obj.num })
      }
    })
  })
  myChartBar.setOption(option)
  myChartBar.off('click')
  myChartBar.on('click', (params) => {
    if (routeInfo.path) {
      if (routeInfo.path == 'downholepersonNum') {
        routeInfo.param.day = params.name
        routeInfo.param.total = params.data.value
      } else if (routeInfo.path == 'turnOutInfo') {
        routeInfo.param.name = params.name
      }
      router.push({ name: routeInfo.path, params: routeInfo.param })
    } else {
      that.barclick(params.name)
    }
  })
}

/** 初始化柱状图 App */
export function getinitBar_app(that, chartBox, unit, routeInfo, width) {
  if (myChartBar != null && myChartBar != '' && myChartBar != undefined) myChartBar.dispose()
  if (!isValidChartContainer(chartBox)) return
  window.addEventListener('resize', () => { myChartBar.resize() })
  let chartDom = chartBox
  myChartBar = echarts.init(chartDom)
  const start = (that.page - 1) * that.size
  const end = that.page * that.size
  let option = {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(0, 201, 189, 1)' },
      { offset: 1, color: 'rgba(17, 124, 184, 1)' },
    ]),
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        var result = params[0].axisValueLabel + '<br>'
        params.forEach(function (item) { if (item.value) result += item.marker + `${unit} :` + item.value + '</br>' })
        return result
      },
      axisPointer: { type: 'shadow' },
    },
    grid: { left: 40, top: 5, containLabel: true },
    xAxis: { type: 'value', splitLine: { show: false }, show: false },
    yAxis: {
      type: 'category', inverse: true,
      axisTick: { show: false },
      axisLine: { show: false, lineStyle: { color: getTheme() ? 'rgb(237 240 249 / 100%)' : '#0a1820' } },
      axisLabel: { show: false, color: ComputedStyle.getPropertyValue('--text-color') },
      max: that.size,
      data: that.barXData.slice(start, end),
    },
    series: [{
      name: '人数', type: 'bar', data: that.barYData.slice(start, end), barWidth: '80%',
      label: { show: true, formatter: '{b}', position: 'left', align: 'left', offset: [10, 0], color: ComputedStyle.getPropertyValue('--text-color'), fontSize: 12 },
      barCateGoryGap: '0%',
    }],
  }
  myChartBar.setOption(option)
  myChartBar.off('click')
  myChartBar.on('click', (params) => {
    if (routeInfo.path) {
      if (routeInfo.path == 'downholeNum_app') {
        routeInfo.param.day = params.name.substring(0, params.name.length - 1)
        routeInfo.param.total = params.data
      } else if (routeInfo.path == 'turnOutInfo_app') {
        routeInfo.param.name = params.name
      }
      router.push({ name: routeInfo.path, params: routeInfo.param })
    } else {
      that.barclick(params.name)
    }
  })
}

/** 堆叠柱状图 App */
export function stackbar_app(that, chartBox, unit, routeInfo, ShowToolBox) {
  if (myChartBar != null && myChartBar != '' && myChartBar != undefined) myChartBar.dispose()
  if (!isValidChartContainer(chartBox)) return
  window.addEventListener('resize', () => { myChartBar.resize() })
  let chartDom = chartBox
  myChartBar = echarts.init(chartDom)
  const start = (that.page - 1) * that.size
  const end = that.page * that.size
  let xAxisData = new Set()
  let legend = new Set()
  let series = []
  let day = ''
  let colors = [
    'rgba(126, 219, 208, 1)', 'rgba(149, 209, 155, 1)', '#E4FF3E',
    'rgba(121, 207, 89, 1)', 'rgba(27, 174, 134, 1)', 'rgba(48, 131, 157, 1)',
    'rgba(12, 88, 133, 1)', 'rgba(12, 66, 120, 1)',
  ]
  colors = colors.reverse()
  that.data.forEach((item) => {
    day = Number(item.day.substring(item.day.lastIndexOf('-') + 1))
    xAxisData.add(day + '号')
    legend.add(item.shiftName)
  })
  let days = Array.from(xAxisData)
  let legends = Array.from(legend).sort(function (a, b) { return a - b })
  legends.forEach((item, index) => {
    series.push({
      label: { show: true, position: 'inside', verticalAlign: 'middle', align: 'center', formatter: '{c}', color: ComputedStyle.getPropertyValue('--text-color') },
      name: item, type: 'bar', stack: '班次',
      emphasis: { focus: 'series' },
      data: [],
      itemStyle: { color: item == '' ? '' : colors[index] },
    })
  })
  that.total = days.length % that.size === 0 ? days.length / that.size : Math.ceil(days.length / that.size)
  let option = {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(0, 201, 189, 1)' },
      { offset: 1, color: 'rgba(17, 124, 184, 1)' },
    ]),
    grid: { left: 20, right: 0, bottom: '15', top: 40, containLabel: true },
    tooltip: { trigger: 'item' },
    toolbox: {
      show: ShowToolBox == undefined ? true : ShowToolBox, bottom: 5, left: 'right',
      feature: { dataView: { readOnly: false }, saveAsImage: {} },
      iconStyle: { borderWidth: 2 },
    },
    legend: {
      itemWidth: 15, itemHeight: 15, data: legends, icon: 'circle', itemHeight: 6, left: 'center',
      textStyle: { color: ComputedStyle.getPropertyValue('--text-color'), fontSize: 10 },
    },
    xAxis: { show: false, splitLine: { show: false } },
    yAxis: { splitLine: { show: false }, data: days.slice(start, end) },
    series: series,
  }
  legends.forEach((legend, index) => {
    that.data.forEach((obj) => {
      if (legend == obj.shiftName) {
        option.series[index].data.push({ name: Number(obj.day.substring(obj.day.lastIndexOf('-') + 1)), value: obj.num })
      }
    })
  })
  option.series.forEach((item) => { item.data = item.data.slice(start, end) })
  myChartBar.setOption(option)
  myChartBar.off('click')
  myChartBar.on('click', (params) => {
    if (routeInfo.path) {
      if (routeInfo.path == 'downholeNum_app') {
        routeInfo.param.day = params.name
        routeInfo.param.total = params.data.value
      } else if (routeInfo.path == 'turnOutInfo') {
        routeInfo.param.name = params.name
      }
      router.push({ name: routeInfo.path, params: routeInfo.param })
    } else {
      that.barclick(params.name)
    }
  })
}

/** 获取URL主题参数 */
export function GetTheme(url, key) {
  if (!url) throw new Error('参数URL不能为空！')
  var t, n, r, i = url.split('?')[1], s = {}
  if (!i) return
  t = i.split('&'), r = null, n = null
  for (var o in t) {
    var u = t[o].indexOf('=')
    u !== -1 && ((r = t[o].substr(0, u)), (n = t[o].substr(u + 1)), (s[r] = n))
  }
  return s[key]
}

/** 公共阴影变量 */
export function getBoxShadow() {
  return '0 4px 8px 0 rgb(0 80 115 / 41%) inset'
}
