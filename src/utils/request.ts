import axios from 'axios'
import { ElMessageBox, ElNotification, ElMessage } from 'element-plus'
import { getToken } from './auth'
import errorCode from './errorCode'

axios.defaults.headers['content-type'] = 'application/json;charset=utf-8'
axios.defaults.headers['caller'] = 'WebMineManage'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 30000,
})

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
    const msg = errorCode[code as keyof typeof errorCode] || res.data.mesg || errorCode['default']

    if (code === 401) {
      ElMessageBox.confirm('您的权限已过期，您可以继续留在该页面，或者重新申请权限', '系统提示', {
        confirmButtonText: '重新申请权限或者重新登录',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        location.href = '/401'
      })
      return Promise.reject(new Error(msg))
    } else if (code === 101) {
      ElNotification.error({ message: msg, type: 'error' })
    } else if (code === 500) {
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    } else if (code !== 100 && code !== 200) {
      return Promise.reject('error')
    } else {
      return res.data
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default service
