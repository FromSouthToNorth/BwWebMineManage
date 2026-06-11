export function parseTime(time: string | number | Date | null | undefined, pattern?: string): string | null {
  if (!time) return null
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date: Date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/')
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj: Record<string, number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result: string, key: string) => {
    let value = formatObj[key]
    if (key === 'a') return ['日', '一', '二', '三', '四', '五', '六'][value]
    if (result.length > 0 && value < 10) value = Number('0' + value)
    return String(value || 0)
  })
}

export function resetForm(refName: string) {
  // Intended for element-plus form refs
}

export function addDateRange(params: Record<string, any>, dateRange: [string, string] | null) {
  if (dateRange) {
    params.beginTime = dateRange[0]
    params.endTime = dateRange[1]
  }
  return params
}

export function praseStrEmpty(str: string | null | undefined): string {
  return str || ''
}

export function praseStrZero(str: string | number | null | undefined): string {
  return String(str || 0)
}

export function praseArrayStr(arr: string[] | null | undefined): string {
  return arr ? arr.join(',') : ''
}

export function praseBeginTime(str: string | null | undefined): string {
  return str ? `${str} 00:00:00` : ''
}

export function praseEndTime(str: string | null | undefined): string {
  return str ? `${str} 23:59:59` : ''
}
