import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/index.cpt',
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true,
  },
  {
    path: '/safetyMonitoring',
    component: () => import('@/views/system/newSafetyMonitoring/index.vue'),
    hidden: true,
  },
  {
    path: '/newAppsSafetyMonitoring',
    component: () => import('@/views/system/newSafetyMonitoring/app.vue'),
    hidden: true,
  },
  {
    path: '/index_phone.cpt',
    component: () => import('@/views/system/safetyMonitoring/app/index.vue'),
    hidden: true,
    redirect: '/index_phone.cpt/safety',
    children: [
      {
        path: 'safety',
        name: '安全监测',
        component: () => import('@/components/SafetyMonitoringTable/app/index.vue'),
      },
      {
        path: 'realTime',
        name: '实时报警',
        component: () => import('@/components/TimerAlarmTable/app/index.vue'),
      },
      {
        path: 'chart',
        name: '统计图',
        component: () => import('@/views/dashboard/BarChart.vue'),
      },
    ],
  },
  {
    path: '/statisticalGraph',
    component: () => import('@/views/system/statisticalGraph/index.vue'),
    hidden: true,
  },
  {
    path: '/yieldMonitor',
    component: () => import('@/views/system/yieldMonitor/index.vue'),
    hidden: true,
  },
  {
    path: '/index.cpt',
    component: () => import('@/views/system/safetyMonitoring/index.vue'),
    hidden: true,
  },
  {
    path: '/safetyMonitoringMore',
    component: () => import('@/views/system/safetyMonitoringMore/index.vue'),
    hidden: true,
  },
  {
    path: '/appSafetyMonitoringMore',
    component: () => import('@/views/system/safetyMonitoringMore/app.vue'),
    hidden: true,
  },
  {
    path: '/appAlarmList',
    component: () => import('@/views/system/appAlarmList/index.vue'),
    hidden: true,
  },
  {
    path: '/minePressure',
    component: () => import('@/views/system/minePressure/index.vue'),
    hidden: true,
  },
  {
    path: '/production',
    component: () => import('@/views/system/production/index.vue'),
    hidden: true,
  },
  /* 移动端人员定位 */
  {
    path: '/personnelLocation_phone.cpt',
    component: () => import('@/views/personnel_location/app/index_app.vue'),
    redirect: '/personnelLocation_phone.cpt/index_app',
    children: [
      {
        path: 'index_app',
        name: 'index_app',
        component: () => import('@/views/personnel_location/app/personnelLocation_app.vue'),
      },
      {
        path: 'trajectoryQuery_app',
        name: 'trajectoryQuery_app',
        component: () => import('@/views/personnel_location/app/trajectoryQuery_app.vue'),
      },
      {
        path: 'userInfo_app',
        name: 'userInfo_app',
        component: () => import('@/views/personnel_location/app/userInfo_app.vue'),
      },
      {
        path: 'userInfo_count_app',
        name: 'userInfo_count_app',
        component: () => import('@/views/personnel_location/app/userInfo_count_app.vue'),
      },
      {
        path: 'his_downhole_app',
        name: 'his_downhole_app',
        component: () => import('@/views/personnel_location/app/his_downhole_app.vue'),
      },
      {
        path: 'downholeNum_app/:year/:month/:day/:total',
        name: 'downholeNum_app',
        component: () => import('@/views/personnel_location/app/downholeNum_app.vue'),
      },
      {
        path: 'downholepersonquery_app',
        name: 'downholepersonquery_app',
        component: () => import('@/views/personnel_location/app/downholepersonquery_app.vue'),
      },
      {
        path: 'personCount_app',
        name: 'personCount_app',
        component: () => import('@/views/personnel_location/app/personCount_app.vue'),
      },
      {
        path: 'turnOutInfo_app/:year/:month/:day/:type/:name',
        name: 'turnOutInfo_app',
        component: () => import('@/views/personnel_location/app/turnOutInfo_app.vue'),
      },
      {
        path: 'deviceState_app',
        name: 'deviceState_app',
        component: () => import('@/views/personnel_location/app/deviceState_app.vue'),
      },
      {
        path: 'deviceHisState_app',
        name: 'deviceHisState_app',
        component: () => import('@/views/personnel_location/app/deviceHisState_app.vue'),
      },
    ],
    hidden: true,
  },
  /* PC 端人员定位 */
  {
    path: '/personnelLocation.cpt',
    component: () => import('@/views/personnel_location/index.vue'),
    hidden: true,
  },
  {
    path: '/downholeinfo',
    component: () => import('@/views/personnel_location/downholeInfo.vue'),
    hidden: true,
  },
  {
    path: '/personalCount',
    component: () => import('@/views/personnel_location/personnelCount/personalCount.vue'),
    hidden: true,
  },
  {
    path: '/userinfo',
    name: 'userinfo',
    component: () => import('@/views/personnel_location/personnelCount/userInfo.vue'),
    hidden: true,
  },
  {
    path: '/downholepersonNum/:year/:month/:day/:total',
    name: 'downholepersonNum',
    component: () => import('@/views/personnel_location/downholepersonNum.vue'),
    hidden: true,
  },
  {
    path: '/turnOutInfo/:year/:month/:day/:type/:name',
    name: 'turnOutInfo',
    component: () => import('@/views/personnel_location/turnOutInfo.vue'),
    hidden: true,
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true,
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true,
  },
]

const router = createRouter({
  history: createWebHistory('/WebMineManage'),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes,
})

export default router
