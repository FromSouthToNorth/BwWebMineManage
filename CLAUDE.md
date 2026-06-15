# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在本仓库中工作时的指引。

## 常用命令

| 命令 | 说明 |
|---------|-------------|
| `pnpm dev` | 启动 Vite 开发服务器（host `0.0.0.0`，端口 `8080`） |
| `pnpm build` | 类型检查（`vue-tsc --noEmit`）+ 生产构建 |
| `pnpm build:prod` | 仅生产构建（跳过类型检查） |
| `pnpm preview` | 预览生产构建 |
| `pnpm test` | 运行全部 Playwright E2E 测试 |
| `pnpm test tests/specs/example.spec.ts` | 运行单个测试文件 |
| `pnpm test -g "test name"` | 按名称运行单个测试 |
| `pnpm test --project=chromium` | 仅运行桌面 Chromium 项目 |
| `pnpm test --project=mobile-chrome` | 仅运行移动端 Chrome 项目 |
| `pnpm test:ui` | 以 UI 模式运行 Playwright 测试 |
| `pnpm lint` | 在 `src/` 中自动修复 ESLint 问题 |

环境变量通过 `.env.development` / `.env.production` 加载：

- `VITE_APP_BASE_API` — API 基础路径（默认 `/net`）
- `VITE_API_TARGET` — 代理目标地址
  - 开发环境：`http://192.163.5.10:33382`
  - 生产环境：`http://192.168.133.110:33382`

## 架构概览

### 技术栈
- **框架**：Vue 3.5 + Composition API + `<script setup lang="ts">`
- **构建**：Vite 6 + TypeScript 5.6 + pnpm 10
- **UI**：Element Plus 2.9（PC 端，默认 `size: 'small'`，`zh-CN` 语言包）+ Vant 4.9（移动端）
- **状态**：Pinia 2.3（setup 风格 store：`defineStore('name', () => {...})`）
- **路由**：Vue Router 4.5，使用 `createWebHistory('/WebMineManage')`
- **图表**：ECharts 5.6 + vue-echarts 7 + zrender 6（底层 canvas）
- **HTTP**：Axios 1.7 拦截器（超时 30000ms）
- **工具库**：`@vueuse/core`、`js-base64`、`jsencrypt`、`fuse.js`、`sortablejs`、`file-saver`、`clipboard`
- **自动导入**：`unplugin-auto-import` 自动导入 `vue`、`vue-router`、`pinia` API（见 `src/types/auto-imports.d.ts`）
- **测试**：Playwright 1.50+（Chromium + Mobile Chrome）

### 模块别名
`vite.config.ts` 将 `@` 解析到 `src/` 目录。项目内所有导入统一使用 `@/components/...`、`@/utils/...` 等形式。

### 全局组件
`src/main.ts` 全局注册了以下组件，在模板中可直接使用：

- `Pagination`
- `SafetyMonitoringStatistics`
- `RightToolbar`
- `TopShow`
- `Setting`

其他共享组件通过桶文件 `src/components/index.ts` 导入。

### SSO 登录流程
1. `vite-plugin/injectSsoSdk.ts` 向 HTML 注入 `<script src="/net/Content/Resource/SDK/bw.sso.sdk.js">`。
2. `src/main.ts` 在挂载应用前调用 `src/utils/sso.ts` 中的 `bwSSOSDKLogin(callback)`。
3. `bwSSOSDKLogin` 检查 URL 是否包含 `mine_key` 查询参数；若有，立即调用 `callback()` 让应用挂载，实际登录由 `src/permission.ts` 处理。
4. 若无 `mine_key` 且全局存在 `BW_SSO_SDK`，则调用 `SSOLogin(hostname, port, callback)`。
5. 若 `BW_SSO_SDK` 不可用且无 `mine_key`，函数仅发出警告并**不会**调用 `callback()`；此时应用不会挂载。
6. `src/permission.ts` 路由守卫负责处理 `mine_key` 自动登录、token 校验及 SSO 登出重定向。它在 `main.ts` 中于 Pinia 安装后动态导入，因为它依赖 `user` store。

### Token 与矿点身份

- `src/utils/auth.ts` — 在 `localStorage` 中读写用户 `token`（供 Axios 与 `user` store 使用）。
- `src/utils/cookie.ts` — 从 cookie 中读取矿点级值（`MineName`、`MineDesc`、`Access-Token`），并提供 `localStorage` 回退（命名空间 `pro__`）。

### Strategy API 模式

所有后端数据请求统一通过 `src/api/system/helpers.ts` 中的策略模式调用：

- **`requestStrategyData(id, params, 'data')`** → `POST /api/PoininfoSmartValid/GetStrategyData`
- **`requestStrategyData(id, params, 'page')`** → `POST /api/PoininfoSmartValid/GetPageStrategyData`（分页）
- **`requestStrategyData(id, params, 'json')`** → `POST /api/PoininfoSmartValid/GetStrategyJsonData`
- **`executeStrategy(id, params)`** → `POST /api/PoininfoSmartValid/ExecuteStrategyCom`

各 API 模块导出带类型的函数，内部以数字策略 ID 调用上述辅助函数：

```ts
// src/api/system/bar.ts — 策略 ID 1942，用于分类统计
import { requestStrategyData, getMineName } from './helpers'

export function getData() {
  return requestStrategyData(1942, [{ name: 'MineName', value: getMineName() }])
}
```

`getMineName()` 由 `helpers.ts` 导出，从 `src/utils/cookie.ts` 读取，并在页面生命周期内缓存结果。
后端响应/错误消息格式见 `api.md`。

### Axios 拦截器行为（`src/utils/request.ts`）

所有请求都会设置请求头 `caller: WebMineManage`，并从 `src/utils/auth.ts` 读取当前 token 放入 `token` 请求头。

| 状态码 | 行为 |
|------|----------|
| 100 / 200 | 成功 — 返回 `res.data` |
| 401 | Token 过期 — `ElMessageBox.confirm` → 跳转 `/401` |
| 101 | 业务错误 — `ElMessage.error(msg)` → reject |
| 500 | 服务端错误 — `ElMessage.error(msg)` → reject |
| 其他 | 显示错误信息 → reject |
| HTTP 错误 | 优先读取 `response.data.mesg`，否则返回网络错误 |

`cleanMessage()` 会去除 API 消息中的 `:提示:`、`:错误:`、`:警告:`、`:信息:` 等分类标签，同时保留前缀数字。

### 数据映射模式

组件需将原始 API 字段统一映射为展示字段：

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

必须包含映射步骤 —— 禁止将原始 API 对象直接传给模板。

### KPI 常量

KPI 元数据（标签、图标、颜色、顶部栏优先级）集中在 `src/constants/kpi.ts` 中，通过 `KPI_LIST` / `KPI_CONFIG` / `TOP_KPI_KEYS` 导出。`KpiSection` 等共享组件直接消费该配置，避免重复定义 KPI。

### ECharts + Composables 模式

可复用的 `useECharts` 组合式函数（`src/composables/useECharts.ts`）：

```ts
const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

async function initChart() {
  if (!init()) return
  setOption({ ...darkChartTheme(), ...chartOptions })
}
```

- `chart` 是 `shallowRef`，访问实例时务必使用 `chart.value`。
- 调用 `setOption()` 前必须先调用 `init()`，并用 `if (!init()) return` 进行防护。
- `darkChartTheme()` 提供暗色主题基础配置（grid、textStyle、tooltip、坐标轴默认样式）。
- 该组合式函数只暴露 `resize()` 和 `dispose()`，**不会自动调用**；组件需自行接入 `ResizeObserver` / `window.resize` 监听，并在 `onBeforeUnmount` 中调用 `dispose()`。
- 如需点击图表空白区域（而非仅柱子/系列），使用 `chart.value.getZr()`（zrender），结合 `convertToPixel` 分段计算 Y 轴区域点击位置。
- 若点击位置基于分段计算，需在 resize 时通过 `ResizeObserver` 重新计算。

### 移动端 / PC 端双模式架构

- **PC 页面**位于视图根目录（如 `views/system/safetyMonitoringMore/index.vue`）。
- **移动端页面**采用以下两种模式之一：
  - `app/` 子目录（如 `views/system/safetyMonitoring/app/index.vue`、`components/SafetyMonitoringTable/app/index.vue`、`views/personnel_location/app/*`）。
  - `app.vue` 同级文件（如 `views/system/safetyMonitoringMore/app.vue`、`views/system/newSafetyMonitoring/app.vue`）。
- 移动端使用 Vant Tabbar 导航 —— 手动实现 `<nav>` + `router.push({ query: route.query })`，以保留 SSO ticket 参数。不要使用 Vant 的 `route` 属性，避免触发整页 SSO 重定向。
- 移动端页面外层包裹 `<NavBar>` 组件（支持图标、标题、副标题、操作插槽）。
- 移动端路由使用形如 `index_phone.cpt`、`personnelLocation_phone.cpt` 的 path 名称。

### 主题系统
- CSS 变量定义在 `:root` / `[data-theme='theme-dark']` / `[data-theme='theme-light']` 上。
- 通过设置 `<html>` 元素的 `data-theme` 属性切换主题。
- 主题解析在 `App.vue` 挂载时执行：URL 查询参数 `theme` → `localStorage` → 默认 `theme-dark`。
- 所有 CSS 集中在 `src/assets/styles/main.css`（单一入口）。
- 图表配色：`--chart-1` 至 `--chart-8`。
- z-index 层级：`--z-content` (10)、`--z-sticky` (20)、`--z-overlay` (30)、`--z-modal` (50)、`--z-loading` (100)。
- 字号：`--font-size-hero`、`--font-size-lg`、`--font-size-base`、`--font-size-sm`、`--font-size-xs`。
- Element Plus 与 Vant 的 CSS 变量也在同一文件中覆盖。
- 支持 `prefers-reduced-motion` 媒体查询。

### Pinia Store

| Store | 文件 | 用途 |
|-------|------|---------|
| `app` | `src/stores/app.ts` | 侧边栏状态、isMobile、size、histPopup |
| `settings` | `src/stores/settings.ts` | 主题（dark/light） |
| `user` | `src/stores/user.ts` | Token、登录动作 |

### Vite 配置
- **基础路径**：`/WebMineManage`（与生产部署及 `createWebHistory` 一致）。
- **开发服务器**：host `0.0.0.0`，端口 `8080`。
- **代理**：`/net`、`/DigitizingMine`、`/cas`、`/bwmes-boot`、`/bwPublic` → 目标地址来自 `VITE_API_TARGET`。
- **构建分块**：`chunk-libs`（vue/router/pinia）、`chunk-element-plus`、`chunk-vant`、`chunk-echarts`。
- **生产构建**：terser 压缩（移除 console/debugger），输出到 `dist/WebMineManage/`。
- **SCSS**：启用 modern-compiler API。
- **自定义插件**：
  - `injectSsoSdk` — 注入 BW SSO SDK 脚本。
  - `generateVersionJson` — 生产构建结束时写入 `dist/<VITE_APP_PATH>/version.json`，使用 `VITE_APP_VERSION` 与 `VITE_APP_PATH`。

### 项目结构

```
src/
├── api/system/          # API 模块，每个模块包含带类型的函数 + 策略 ID
│   └── helpers.ts       # requestStrategyData()、executeStrategy()、getMineName()
├── assets/styles/       # 单一 main.css，包含 CSS 变量与组件样式覆盖
├── components/          # 共享组件（每个组件一个目录）
│   ├── index.ts         # 桶导出
│   ├── SafetyMonitoringTable/  # PC（根目录）+ 移动端（app/）双版本
│   ├── TimerAlarmTable/        # PC（根目录）+ 移动端（app/）双版本
│   ├── KpiBar/          # 通用 KPI 指标条
│   ├── KpiSection/      # 安全监测页面使用的 KPI 卡片网格
│   ├── SafetyMonitoringDetail/  # 详情 + 历史趋势弹窗
│   ├── StatusBadge/     # 状态指示器（点/徽标/文字，5 种状态）
│   ├── GlassCard/       # 毛玻璃卡片容器
│   ├── NavBar/          # 增强导航栏（图标/副标题/操作插槽）
│   └── …                # Pagination、Hamburger、BackToTop、Setting 等
├── composables/         # useECharts.ts（图表生命周期、暗色主题、zrender 点击）
├── constants/           # kpi.ts（KPI 元数据统一配置）
├── router/index.ts      # 所有路由集中在一个文件，全部隐藏（无侧边栏导航）
├── stores/              # Pinia（app、settings、user）
├── types/               # env.d.ts、global.d.ts（BW_SSO_SDK 类型）、auto-imports.d.ts
├── utils/               # request.ts（axios）、auth.ts、sso.ts、cookie.ts、errorCode.ts
├── views/               # 页面视图
│   ├── system/          # safetyMonitoring、safetyMonitoringMore、minePressure、production、appAlarmList 等
│   ├── dashboard/       # BarChart、AppCharts、minePressure 图表、production 图表
│   ├── personnel_location/  # PC（根目录）+ 移动端（app/）子目录
│   └── error/           # 401、404
├── App.vue              # 根组件：设备类型检测 + 挂载时设置主题
├── main.ts              # 入口：SSO → Pinia → 动态导入 permission → Router → 挂载
└── permission.ts        # 路由守卫（mine_key 登录、token 校验）

vite-plugin/             # 自定义 Vite 插件
tests/
├── specs/               # Playwright 测试文件
├── utils/               # mock.ts（SSO + API mock fixture）、setup.ts（自定义 fixture）
└── fixtures/            # Mock JSON 数据
design-system/           # 层级化设计系统文档
├── MASTER.md            # 全局设计规则
├── guidelines-supplement.md  # ECharts 指南、UX 模式、Vue 实现
└── pages/               # 页面级覆盖规则
```

### 组件规范
- 所有组件使用 `<script setup lang="ts">` 并配合 `defineOptions({ name: '...' })`。
- Props 使用 `withDefaults(defineProps<{...}>(), {...})` 定义类型与默认值。
- Emits 使用 `defineEmits<{ eventName: [args] }>()` 定义类型。
- 样式使用 scoped + CSS 自定义属性。
- 自动刷新在 `onMounted` 中通过 `setInterval` 实现，并在 `onBeforeUnmount` 中清除。
- 异步内容使用 loading 骨架屏，无数据时展示空状态。

### 测试策略
- Playwright 配合 `tests/utils/setup.ts` 中的自定义 fixture。
- Fixture 自动 mock `BW_SSO_SDK` 并拦截 API 路由返回真实 mock 数据。
- 两个测试项目：`chromium`（桌面 Chrome，`zh-CN`）和 `mobile-chrome`（Pixel 5）。
- WebServer 配置为测试期间在端口 `8081` 启动 Vite（`node ./node_modules/vite/bin/vite.js --port 8081`）。
- 测试使用 `baseURL: http://localhost:8081`（开发服务器运行在 `8080`）。
- 失败时截图、失败时保留视频、首次重试时保留 trace。

### 设计系统
`design-system/` 目录包含层级化设计系统：
- `MASTER.md` — 全局唯一事实来源（CSS 变量清单、色板、排版层级、z-index 系统、组件规范、图表规则、无障碍）。
- `pages/<name>.md` — 页面级覆盖规则，优先级高于 `MASTER.md`。
- 设计新 UI 或修改现有样式时，务必参考上述文件。
