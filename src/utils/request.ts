import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getToken } from './auth'
import errorCode from './errorCode'

axios.defaults.headers['content-type'] = 'application/json;charset=utf-8'
axios.defaults.headers['caller'] = 'WebMineManage'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 30000,
})

/** 清理 API 错误消息中的分类标签，如 "1990:提示:列名 'AreaName' 无效。" → "1990: 列名 'AreaName' 无效。" */
function cleanMessage(mesg: string): string {
  if (!mesg) return ''
  // 去掉 ":提示:"、":错误:"、":警告:"、":信息:" 等分类标签，保留前导数字
  return mesg.replace(/:\s*(提示|错误|警告|信息)\s*:/, ': ').trim()
}

service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  (error) => {
    console.error(error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (res) => {
    const code = res.data.code || 200
    const rawMsg = res.data.mesg || ''
    const msg = cleanMessage(rawMsg) || errorCode[code as keyof typeof errorCode] || errorCode['default']

    if (code === 100 || code === 200) {
      // 成功
      return res.data
    }
    // 以下为错误处理 —— 全部 reject，调用方 catch 可拿到错误信息
    if (code === 401) {
      ElMessageBox.confirm('您的权限已过期，您可以继续留在该页面，或者重新申请权限', '系统提示', {
        confirmButtonText: '重新申请权限或者重新登录',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        location.href = '/401'
      })
      return Promise.reject(new Error(msg))
    }

    if (code === 101) {
      // 业务错误（如查询参数错误、数据不存在）
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }

    if (code === 500) {
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }

    // 其他错误码（102、103 等）
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  },
  (error) => {
    // 先尝试从 response body 提取业务错误消息（后端可能 HTTP 5xx + JSON 错误体）
    const respData = error.response?.data
    const respMsg = respData?.mesg || respData?.msg || respData?.message || ''
    const cleanRespMsg = cleanMessage(respMsg)

    if (cleanRespMsg) {
      ElMessage.error(cleanRespMsg)
      return Promise.reject(new Error(cleanRespMsg))
    }

    // 无业务错误体时，使用网络层错误信息
    let message = '网络请求失败，请检查网络连接'
    if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    } else if (error.message?.includes('Network Error')) {
      message = '网络异常，无法连接到服务器'
    } else if (error.response?.status) {
      const status = error.response.status
      message = errorCode[status as keyof typeof errorCode] || `服务异常 (${status})`
    }
    ElMessage.error(message)
    return Promise.reject(new Error(message))
  }
)

export default service
