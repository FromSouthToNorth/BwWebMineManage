# CLAUDE.md

本文档为 Claude Code（claude.ai/code）提供本仓库的指引。

## 常用命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 启动 Vite 开发服务器 `0.0.0.0:8080` |
| `pnpm build` | 类型检查（`vue-tsc --noEmit`）+ 生产构建 |
| `pnpm build:prod` | 跳过类型检查直接构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm test` | 运行所有 Playwright E2E 测试 |
| `pnpm test tests/specs/example.spec.ts` | 运行单个测试文件 |
| `pnpm test -g "test name"` | 按名称运行测试 |
| `pnpm test --project=chromium` | 仅桌面端 Chromium |
| `pnpm test --project=mobile-chrome` | 仅移动端 Chrome |
| `pnpm test:ui` | Playwright UI 模式 |
| `pnpm lint` | 自动修复 `src/` 内的 ESLint 问题 |

> **注意：** 项目依赖 ESLint v9，但目前没有 `eslint.config.(js|mjs|cjs)` 文件，因此 `pnpm lint` 会失败。

环境变量从 `.env.development` / `.env.production` 加载：

- `VITE_APP_BASE_API` — API 基础路径（默认 `/net`）
- `VITE_API_TARGET` — 代理目标地址
  - 开发环境：`http://192.163.5.10:33382`
  - 生产环境：`http://192.168.133.110:33382`

## 架构概览

### 技术栈

- Vue 3.5 + Composition API + `<script setup lang="ts">`（大多数页面）
- Vite 6 + TypeScript 5.6 + pnpm 10
- Element Plus 2.9（PC，默认 size `small`，`zh-CN`）+ Vant 4.9（移动端）
- Pinia 2.3（setup 风格 store）
- Vue Router 4.5，使用 `createWebHistory('/WebMineManage')`
- ECharts 5.6 + vue-echarts 7 + zrender 6
- Axios 1.7
- Playwright 1.50+（Chromium + Mobile Chrome）

`unplugin-auto-import` 自动导入 `vue`、`vue-router`、`pinia` 的 API（`ref`、`computed`、`watch`、`useRoute`、`useRouter`、`defineStore` 等），声明文件在 `src/types/auto-imports.d.ts`。**不**自动导入自定义 composable（如 `usePersonnelLocation`、`useECharts`），这些需要显式 import。

全局类型声明：
- `src/types/global.d.ts` — `BWSSOSDK` 接口
- `src/types/env.d.ts` — Vite 环境变量类型
- `src/types/kpi.ts` — KPI 配置类型
- `src/types/auto-imports.d.ts` — 自动导入的 API 类型（由 `unplugin-auto-import` 生成）

### 模块别名

`vite.config.ts` 将 `@` 映射到 `src/`。始终使用 `@/components/...`、`@/utils/...` 等路径。

### 路由结构

PC 和移动端路由在 `src/router/index.ts` 中分开定义：

| 路径 | 类型 | 组件 |
|---|---|---|
| `/index.cpt` | PC | 安全监测概览 |
| `/safetyMonitoringMore` | PC | 安全监测更多 |
| `/statisticalGraph` | PC | 统计图表 |
| `/minePressure` | PC | 矿压监测 |
| `/yieldMonitor` | PC | 产量监测 |
| `/production` | PC | 生产监控 |
| `/personnelLocation.cpt` | PC | 人员定位主页 |
| `/index_phone.cpt` | 移动端（4 个子路由） | 安全、实时报警、图表 |
| `/personnelLocation_phone.cpt` | 移动端（11 个子路由） | 人员定位 |

大部分后台页面在 `src/views/system/<module>/index.vue`。人员定位路由最复杂，包含参数化路径如 `/downholepersonNum/:year/:month/:day/:total`。

### PC + 移动端双模式

- PC 页面直接放在 views 根目录，如 `views/system/safetyMonitoringMore/index.vue`。
- 移动端页面有两种形式：
  - `app/` 子目录，如 `views/system/safetyMonitoring/app/index.vue` 或 `components/SafetyMonitoringTable/app/index.vue`
  - `app.vue` 同级文件，如 `views/system/safetyMonitoringMore/app.vue`
- 移动端路由名使用 `index_phone.cpt` / `personnelLocation_phone.cpt`。
- 移动端 TabBar 为手写的 `<nav>` + `router.push({ query: route.query })`，以保留 SSO ticket 参数。**不要**使用 Vant Tabbar 的 `route` prop。
- 移动端页面包裹在 `<NavBar>` 组件内。

### 全局注册组件

`src/main.ts` 全局注册了：`Pagination`、`SafetyMonitoringStatistics`、`RightToolbar`、`TopShow`、`Setting`，可直接在模板中使用。其他共享组件通过 `src/components/index.ts` 导出：`NavBar`、`KpiBar`、`KpiSection`、`StatusBadge`、`GlassCard`、`Hamburger`、`BackToTop`、`SafetyMonitoringTable`、`TimerAlarmTable`。

### SSO 登录流程

1. `vite-plugin/injectSsoSdk.ts` 注入 `<script src="/net/Content/Resource/SDK/bw.sso.sdk.js">`。
2. `src/main.ts` 在挂载前调用 `bwSSOSDKLogin(callback)`（来自 `src/utils/sso.ts`）。
3. 如果 URL 中包含 `mine_key`，立即调用 `callback()`；实际登錄由 `src/permission.ts` 处理。
4. 否则，如果全局存在 `BW_SSO_SDK`，调用 `SSOLogin(hostname, port, callback)`。
5. 如果既无 SDK 也无 `mine_key`，打印警告且**不**调用 `callback()`，应用不会挂载。

### 路由守卫（`src/permission.ts`）

`router.beforeEach` 处理三种场景：
1. **URL 中有 `mine_key`** — Base64 解码凭证字符串 `username;password`，调用 `userStore.Login()`，然后重定向到原始路径（不带 key）。
2. **有 token**（从 cookie `Access-Token` 获取）— 允许导航。
3. **都没有** — 调用 `BW_SSO_SDK.SSOLogout()` 重定向到 SSO 登录页。

`permission.ts` 在 Pinia 安装后动态导入（`main.ts`），因为它依赖 `user` store。

### Identity & Tokens

- `src/utils/auth.ts` 在 `localStorage` 中读写用户 `token`，供 Axios 和 `user` store 使用。
- `src/utils/cookie.ts` 从 cookie 读取矿井级别信息（`MineName`、`MineDesc`、`Access-Token`），`localStorage` 后备存储使用 `pro__` 命名空间。

### App.vue 入口

`src/App.vue` 在挂载时做两件事：
1. **主题解析** — URL 参数 `theme` → `localStorage` → 默认 `theme-dark`。设置 `<html>` 的 `data-theme` 属性并同步到 Pinia `settingsStore`。
2. **设备检测** — 检查 `navigator.userAgent` 判断移动端，设置 `appStore.setIsMobile()` 并动态调整 Element Plus 的 `size`。

### 策略 API 模式

所有后端请求通过 `src/api/system/helpers.ts`：

- `requestStrategyData(id, params, 'data')` → `POST /api/PoininfoSmartValid/GetStrategyData`
- `requestStrategyData(id, params, 'page')` → `POST /api/PoininfoSmartValid/GetPageStrategyData`（分页）
- `requestStrategyData(id, params, 'json')` → `POST /api/PoininfoSmartValid/GetStrategyJsonData`
- `executeStrategy(id, params)` → `POST /api/PoininfoSmartValid/ExecuteStrategyCom`

API 模块导出带类型的函数，内部调用上述辅助函数并传入数字策略 ID：

```ts
// src/api/system/bar.ts — 策略 ID 1942，用于分类统计
import { requestStrategyData, getMineName } from './helpers'

export function getData() {
  return requestStrategyData(1942, [{ name: 'MineName', value: getMineName() }])
}
```

`getMineName()` 从 `src/utils/cookie.ts` 读取，缓存结果供页面生命周期内使用。参数遵循 `{ name: string, value: string | number }` 格式（`StrategyParam` 类型）。

后端响应格式和错误消息格式见 `api.md`。

### Axios 拦截器（`src/utils/request.ts`）

每次请求设置请求头 `caller: WebMineManage` 和 `token`（来自 `src/utils/auth.ts`）。

| 状态码 | 行为 |
|---|---|
| 100 / 200 | 成功 — 返回 `res.data` |
| 401 | Token 过期 — `ElMessageBox.confirm` 后重定向到 `/401` |
| 101 | 业务错误 — `ElMessage.error(msg)` 后 reject |
| 500 | 服务端错误 — `ElMessage.error(msg)` 后 reject |
| 其他 | 显示错误消息后 reject |
| HTTP 错误 | 优先使用 `response.data.mesg`，否则返回网络错误 |

`cleanMessage()` 去除 `:提示:`、`:错误:`、`:警告:`、`:信息:` 等标签前缀，保留前导数字。

### 数据映射约定

组件在将数据传给模板前必须将原始 API 字段映射为展示字段，禁止将原始 API 对象直接传入模板。

```ts
const mapped = (items || []).map((item: any) => ({
  devName: item.devLabel || item.devAddress,
  devValue: item.detectionVal,
  alarmStatus: item.alarmType === 1 ? '报警' : '',
  category: item.categoryName,
  area: item.devArea,
  substation: item.stationNo,
}))
```

### 日期处理

`dayjs` 集中在 `src/utils/util.ts`。使用其中的 `formatDateTime()` 和 `getRecentDayRange()`，不要在组件中直接 `import dayjs`。人员定位的 `downholeInfoJs.ts` 之前有重复的 `formatterDate`/`getCurrDateTime`/`getInitDate`，现已删除，统一使用 `util.ts` 版本。

### 工具函数

`src/utils/` 中的重要工具模块：

| 文件 | 关键导出 | 用途 |
|---|---|---|
| `util.ts` | `formatDateTime()`、`getRecentDayRange()`、`parseTime()`、`addDateRange()` | dayjs 日期格式化；`parseTime()` 为旧版 |
| `auth.ts` | `getToken()`/`setToken()`/`removeToken()` | localStorage token 管理 |
| `cookie.ts` | `getMineName()`、`getToken()`、`getMineDesc()` | cookie 读取，`pro__` 命名空间兜底 |
| `constants.ts` | `DATA_THEME`、`TOKEN_KEY` | — |
| `errorCode.ts` | `{ '401': '...', '403': '...', ... }` | 错误码 → 中文消息 |
| `style.ts` | `tableRowClassName()` | 表格隔行变色 |
| `request.ts` | Axios 实例 | 含拦截器、错误处理、401 重定向 |
| `sso.ts` | `bwSSOSDKLogin(callback)` | SSO SDK 登录 |
| `personnelLocationUtils.ts` | `handleApiResponse()`、`handleColumnClick()`、`handleOperationClick()` | 人员定位模块辅助函数 |

`formatDateTime()` 和 `getRecentDayRange()` 使用 dayjs，**优先使用**。`parseTime()` 为旧版实现，新代码不要使用。

### KPI 常量

KPI 元数据（标签、图标、颜色、顶栏优先级）集中在 `src/constants/kpi.ts`，导出 `KPI_LIST`、`KPI_CONFIG`、`TOP_KPI_KEYS`。`KpiSection` 等共享组件直接引用此配置。

### ECharts + Composables 模式

使用 `src/composables/useECharts.ts` 管理图表生命周期：

```ts
const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

async function initChart() {
  if (!init()) return
  setOption({ ...darkChartTheme(), ...chartOptions })
}
```

- `chart` 是 `shallowRef`，通过 `chart.value` 访问实例。
- 必须先调用 `init()` 再 `setOption()`，并用 `if (!init()) return` 保护。
- `darkChartTheme()` 提供暗色主题基础配置（grid、textStyle、tooltip、axis 默认值）。
- composable 暴露 `resize()` 和 `dispose()`，但**不**自动调用。组件需自行接入 `ResizeObserver` / `window.resize`，并在 `onBeforeUnmount` 中调用 `dispose()`。
- 点击图表空白区域（而非系列元素）时，使用 `chart.value.getZr()` + `convertToPixel` 配合分段 Y 轴计算；在 `ResizeObserver` 中重算。

### 主题系统

- CSS 变量定义在 `src/assets/styles/main.css` 的 `:root`、`[data-theme='theme-dark']`、`[data-theme='theme-light']` 中。
- 主题解析在 `App.vue` 挂载时执行：URL 参数 `theme` → `localStorage` → 默认 `theme-dark`。
- 图表颜色：`--chart-1` … `--chart-8`。
- Z-index 层级：`--z-content` (10)、`--z-sticky` (20)、`--z-overlay` (30)、`--z-modal` (50)、`--z-loading` (100)。
- 字号：`--font-size-hero`、`--font-size-lg`、`--font-size-base`、`--font-size-sm`、`--font-size-xs`。
- Element Plus 和 Vant 的 CSS 变量也在同一文件中覆写。
- 支持 `prefers-reduced-motion`。

### Pinia Store

| Store | 文件 | 用途 |
|---|---|---|
| `app` | `src/stores/app.ts` | 侧边栏状态、`isMobile`、size、`histPopup` |
| `settings` | `src/stores/settings.ts` | 主题（暗色/浅色） |
| `user` | `src/stores/user.ts` | Token、登录操作 |

### Vite 配置说明

- 基础路径：`/WebMineManage`（与生产部署和 `createWebHistory` 一致）。
- 开发服务器：`host: '0.0.0.0'`、`port: 8080`。
- 代理：`/net`、`/DigitizingMine`、`/cas`、`/bwmes-boot`、`/bwPublic` → `VITE_API_TARGET`。
- 手动分包：`chunk-libs`、`chunk-element-plus`、`chunk-vant`、`chunk-echarts`。
- 生产构建：terser 压缩（`drop_console`、`drop_debugger`），输出到 `dist/WebMineManage/`。
- SCSS 使用 modern-compiler API。
- 自定义插件在 `vite-plugin/` 中：
  - `injectSsoSdk.ts` — 注入 BW SSO SDK 脚本。
  - `generateVersionJson.ts` — 生产构建结束时写入 `dist/<VITE_APP_PATH>/version.json`，使用 `VITE_APP_VERSION` 和 `VITE_APP_PATH`。

### 组件规范（主系统）

- 使用 `<script setup lang="ts">` + `defineOptions({ name: '...' })`。
- Props：`withDefaults(defineProps<{...}>(), {...})`。
- Emits：`defineEmits<{ eventName: [args] }>()`。
- 样式：scoped + CSS 自定义属性。
- 在 `onMounted` 中用 `setInterval` 自动刷新，在 `onBeforeUnmount` 中清除。
- 异步内容显示 loading 骨架屏，无数据显示空状态。

### 人员定位模块（遗留迁移）

人员定位模块（`src/views/personnel_location/`、`src/components/personnelLocation/`）从 Vue 2 项目（`D:\bw\Bw.WebMineManage`）迁移而来，使用与主系统**不同的模式**：

- **Options API**（`export default { data() {...}, methods: {...} }`）— 而非 `<script setup lang="ts">`。
- **Hybrid `setup()` + Options 模式** — 组件通常同时使用 `setup()` 和 `data()`/`methods()`。`setup()` 中调用 composable 并将返回值 return 出去；本地状态和业务方法在 `data()`/`methods()` 中定义。两种生命周期互不冲突。
- **共享 composable** — 表格/分页状态由 `src/composables/usePersonnelLocation.ts` 提供。弹窗组件通过 `setup()` 使用：`const { showPopup, table, selectionChange, pageFieldConvert, addDefaultParam } = usePersonnelLocation()`。composable 暴露 `table` 状态（dataSource、total、pageNo、pageSize、loading、queryParam）和工具函数；`search`/`pageChange` 方法需在每个消费组件中自行定义。
- **Scoped 样式** — 通过 `.personnel-page` 类限定作用域，防止样式泄漏到其他页面。

#### 页面结构

`src/views/personnel_location/` 包含：`index.vue`（主布局，含头部报警数/下井人数 + 图表区域 + 底部 infoList 表格 + 弹窗引用）、`echarts.vue` + `infoList.vue` + `downholeInfoJs.ts`（图表子模块）、以及三个历史查询报表页面（`downholepersonNum.vue`、`turnOutInfo.vue`、`downholeInfo.vue`）。`app/` 目录下有 12 个移动端子页面。配置项在 `config/` 子目录下。

#### 内联 ECharts 模块（`downholeInfoJs.ts`）

该文件管理人员定位图表，**不**使用 `useECharts` composable，而是使用模块级变量（`myChartBar`、`myChartLine`）。导出 7 个图表初始化函数（`GetinitLine`、`GetinitLines`、`getinitBar`、`getinitBarZoom`、`stackbar`、以及对应的 `_app` 移动端变体）、`getYear()`（年份选择器）和 `pageFieldConvert()`（注意：后者的功能与 `usePersonnelLocation` 的 `pageFieldConvert` 重复）。

关键规则：
- `echarts.init()` 前必须检查 `clientWidth > 0 && clientHeight > 0`，否则会静默失败。
- 使用 `getCssVar()`、`createLinearGradient()`、`isLightTheme()`（来自 `useECharts.ts`）获取主题变量。
- `BAR_GRADIENT` 通过 `createLinearGradient()` 创建。
- 通过 `window.addEventListener('resize', ...)` 手动监听 resize。`_resizeGuard` 防止 resize 事件风暴。
- CSS 变量以 `--pl-*` 为前缀，在 `main.css` 的 `:root` 中定义，浅色覆写在 `html[data-theme='theme-light']` 中。

编辑人员定位文件时，请匹配既有风格（Options API + composable setup 模式），不要逐一转为 Composition API。

### 弹窗模式（人员定位）

人员定位使用子组件 ref 弹窗模式：

```vue
<trackInfoPopup ref="trackInfoPopup"></trackInfoPopup>
<userInfoPopup ref="userInfoPopup"></userInfoPopup>

<script>
// 从父组件打开：
this.$refs.trackInfoPopup.show(row)
</script>
```

有两种弹窗实现：
- **直接使用 `el-dialog`** — `userInfoPopup.vue` 直接在模板中使用 `<el-dialog append-to-body>`。
- **封装 `trajectoryQuery.vue`** — 大部分弹窗（`downUserNumInfoPopup`、`deviceStatePopup` 等）使用 `<Popup>` 组件，该组件封装了 `el-dialog`。接受 `:appendToBody` prop（默认 `false`），通过 `v-model` + `:isShow` prop 控制显隐。

关键规则：
- 在 flex/scroll 容器内的弹窗**必须**设置 `append-to-body`，否则会被层叠上下文裁剪。
- Scoped 的 `::v-deep` 样式无法作用于 `append-to-body` 的弹窗（DOM 被移到了组件外）。弹窗外观样式应放在非 scoped `<style>` 块中，并用选择器限定范围防止全局泄漏。
- 弹窗 CSS 变量（`--popup-bgColor`、`--popup-textColor`、`--user-popup-*`）在 `main.css` 的 `:root` 中定义，`html[data-theme='theme-light']` 中有浅色覆写。

### API 模块

| 文件 | 模块 | 主要 ID |
|---|---|---|
| `safetyMonitoring.ts` | 安全监测 | 报警记录 |
| `newSafetyMonitoring.ts` | 新版安全监测 | 区域/偏差/压力 |
| `minePressure.ts` | 矿压监测 | 1942–1987 |
| `personnelLocation.ts` | 人员定位 | ~30 个函数，ID 5259–6748 |
| `production.ts` | 生产监控 | 生产指标 |
| `yieldMonitor.ts` | 产量监测 | 产量数据 |
| `statisticalGraph.ts` | 统计图表 | 汇总查询 |
| `appAlarm.ts` | 移动端报警 | 移动报警列表 |
| `ealTimeAlarm.ts` | 实时报警 | 实时报警 |
| `bar.ts` | 柱状图数据 | 1942 分类统计 |
| `mine.ts` | 矿井信息 | 矿井查询 |
| `helpers.ts` | 策略 API 辅助 | 共享工具 + `getMineName()` |

### 测试

Playwright 使用 `tests/utils/setup.ts` 中的自定义 fixture，该 fixture 模拟 `BW_SSO_SDK` 并用 Mock 数据拦截 API 路由。两个测试项目：`chromium`（桌面端）和 `mobile-chrome`（Pixel 5）。WebServer 在测试时以 `8081` 端口运行 Vite；测试使用 `baseURL: http://localhost:8081`，开发时使用 `8080`。失败/首次重试时保留截图、视频和 trace。

### Pagination 分页组件

使用全局注册的 `<Pagination>` 组件（`src/components/Pagination/index.vue`）实现所有分页表格：
- Props：`total`、`page`、`limit`、`pageSizes`、`layout`、`small`、`hidden`（总数为 0 时隐藏）
- 事件：`@pagination="{ page, limit }"`
- 人员定位的 `tableComponent.vue` 内部使用该组件

### TableComponent 表格组件（人员定位）

`src/components/personnelLocation/tableComponent.vue`（`BaseTable`）是人员定位所有视图共用的表格封装组件：
- 支持选择框、序号、排序、操作列插槽（直接按钮 + "更多"下拉）
- 分页/尺寸变更时触发 `tableUpdate` 事件，参数 `{ currentPage, pageSize }`
- 列配置通过 `src/components/personnelLocation/config/tableColumns.ts` 中的 `ColumnConfig` 接口定义类型
- 使用集中的 `<Pagination>` 组件（而非内联 `el-pagination`）
- **避免使用 `el-icon-*` CSS 类名** — 它们在 Element Plus Vue 3 中无效。使用内联 SVG 代替。

### 设计系统

`design-system/` 目录包含分层设计系统：

- `MASTER.md` — 全局事实标准（CSS 变量映射表、调色板（深色/浅色）、排版、z-index、布局栅格、组件规则、图表规则、动效规范、无障碍）。
- `pages/safetyMonitoring.md` — 安全监测模块的页面级覆写（布局、表格、图表、报警规则）。
- `pages/personnelLocation.md` — 人员定位模块的页面级覆写（配色、图表、表格、弹窗）。
- `pages/minePressure.md` — 矿压监测的页面级覆写。
- `pages/dashboard.md` — 概览仪表盘的设计规则。
- `guidelines-supplement.md` — 补充设计指南。

设计或修改 UI 时请参考这些文档。

## 已知问题

- **`src/views/system/newSafetyMonitoring/app.vue`**：预存在的 TS 解析错误（`TS1005: ';' expected`），不影响功能，与本次改动无关。不要尝试修复。
