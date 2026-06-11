import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Vant from 'vant'
import 'vant/lib/index.css'
import 'normalize.css/normalize.css'

import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import { bwSSOSDKLogin } from './utils/sso'

// 全局组件
import Pagination from '@/components/Pagination/index.vue'
import SafetyMonitoringStatistics from '@/components/SafetyMonitoringStatistics/index.vue'
import RightToolbar from '@/components/RightToolbar/index.vue'
import TopShow from '@/components/TopShow/index.vue'
import Setting from '@/components/Setting/index.vue'

// 等待 SSO 登录完成后再挂载应用
bwSSOSDKLogin(() => {
  const app = createApp(App)

  const pinia = createPinia()
  app.use(pinia)

  // 路由需要在 Pinia 之后注册（permission.ts 依赖 store）
  import('./permission')

  app.use(router)
  app.use(ElementPlus, { size: 'small' })
  app.use(Vant)

  // 全局注册组件
  app.component('Pagination', Pagination)
  app.component('SafetyMonitoringStatistics', SafetyMonitoringStatistics)
  app.component('RightToolbar', RightToolbar)
  app.component('TopShow', TopShow)
  app.component('Setting', Setting)

  app.mount('#app')
})
