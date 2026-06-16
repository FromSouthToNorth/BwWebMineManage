# BwWebMineManage

煤矿安全监测综合管理前端系统，基于 Vue 3 + Vite 构建，支持 PC 端与移动端双模式，服务于监控中心调度、安全管理人员及移动巡检场景。

## 技术栈

- **框架**：Vue 3.5 + Composition API + TypeScript 5.6
- **构建工具**：Vite 6
- **UI 库**：Element Plus 2.9（PC 端）+ Vant 4.9（移动端）
- **状态管理**：Pinia 2.3
- **路由**：Vue Router 4.5
- **图表**：ECharts 5.6 + vue-echarts 7
- **HTTP**：Axios 1.7
- **测试**：Playwright 1.50+
- **包管理器**：pnpm 10

## 前置要求

- Node.js（建议使用 LTS 版本）
- pnpm 10

## 安装依赖

```bash
pnpm install
```

## 开发

```bash
pnpm dev
```

开发服务器默认监听 `0.0.0.0:8080`，并代理 API 请求到开发环境后端。

## 构建

```bash
# 类型检查 + 生产构建
pnpm build

# 仅生产构建（跳过类型检查）
pnpm build:prod

# 预览生产构建
pnpm preview
```

生产构建输出目录为 `dist/WebMineManage`，基础路径为 `/WebMineManage`。

## 测试

```bash
# 运行全部 Playwright E2E 测试
pnpm test

# 运行单个测试文件
pnpm test tests/specs/example.spec.ts

# 按名称运行单个测试
pnpm test -g "test name"

# 仅桌面 Chromium 项目
pnpm test --project=chromium

# 仅移动端 Chrome 项目
pnpm test --project=mobile-chrome

# UI 模式
pnpm test:ui
```

## 代码检查

```bash
pnpm lint
```

ESLint 会在 `src/` 目录下自动修复可修复的问题。

## 环境变量

环境变量通过 `.env.development` 与 `.env.production` 加载：

| 变量名 | 说明 | 开发环境值 | 生产环境值 |
|--------|------|------------|------------|
| `VITE_APP_BASE_API` | API 基础路径 | `/net` | `/net` |
| `VITE_API_TARGET` | 代理目标地址 | `http://192.163.5.10:33382` | `http://192.168.133.110:33382` |

## 项目结构

```
src/
├── api/system/       # 后端策略 API 封装
├── assets/styles/    # 全局样式与 CSS 变量
├── components/       # 共享组件
├── composables/      # 组合式函数
├── constants/        # 常量配置（如 KPI 元数据）
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # 类型声明
├── utils/            # 工具函数（SSO、请求、认证等）
├── views/            # 页面视图
│   ├── system/       # 安全监测、压力监测、生产监控等
│   ├── dashboard/    # 数据大屏与图表
│   ├── personnel_location/ # 人员定位
│   └── error/        # 401、404 等错误页
├── App.vue
├── main.ts
└── permission.ts     # 路由守卫与 SSO 处理
```

## 架构与开发约定

### Strategy API 模式

所有后端数据请求统一通过 `src/api/system/helpers.ts` 中的策略辅助函数发起：

| 函数 | 说明 |
|------|------|
| `requestStrategyData(id, params, 'data')` | `POST /api/PoininfoSmartValid/GetStrategyData` |
| `requestStrategyData(id, params, 'page')` | `POST /api/PoininfoSmartValid/GetPageStrategyData`（分页） |
| `requestStrategyData(id, params, 'json')` | `POST /api/PoininfoSmartValid/GetStrategyJsonData` |
| `executeStrategy(id, params)` | `POST /api/PoininfoSmartValid/ExecuteStrategyCom` |

各 API 模块导出带类型的函数，内部以数字策略 ID 调用上述辅助函数。

### 数据映射

组件需将原始 API 字段统一映射为展示字段，禁止将原始 API 对象直接传给模板。示例：

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

### 全局组件

`src/main.ts` 全局注册了 `Pagination`、`SafetyMonitoringStatistics`、`RightToolbar`、`TopShow`、`Setting`，模板中可直接使用。其他共享组件通过 `src/components/index.ts` 导入。

### 状态管理（Pinia）

| Store | 文件 | 用途 |
|-------|------|------|
| `app` | `src/stores/app.ts` | 侧边栏、isMobile、size、histPopup |
| `settings` | `src/stores/settings.ts` | 主题（dark/light） |
| `user` | `src/stores/user.ts` | Token、登录动作 |

### ECharts 使用

通过 `src/composables/useECharts.ts` 管理图表生命周期：

```ts
const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

async function initChart() {
  if (!init()) return
  setOption({ ...darkChartTheme(), ...chartOptions })
}
```

- `chart` 为 `shallowRef`，访问实例时使用 `chart.value`
- 调用 `setOption()` 前必须先调用 `init()`
- 组件需自行接入 resize 监听，并在 `onBeforeUnmount` 中调用 `dispose()`

### KPI 常量

KPI 元数据（标签、图标、颜色、顶部栏优先级）集中在 `src/constants/kpi.ts`，通过 `KPI_LIST` / `KPI_CONFIG` / `TOP_KPI_KEYS` 导出，`KpiSection` 等组件直接消费。

### 移动端 / PC 端双模式

- **PC 页面**：位于视图根目录，如 `views/system/safetyMonitoringMore/index.vue`
- **移动端页面**：
  - `app/` 子目录，如 `views/system/safetyMonitoring/app/index.vue`
  - 或 `app.vue` 同级文件，如 `views/system/safetyMonitoringMore/app.vue`
- 移动端使用 Vant Tabbar 手动实现 `<nav>` + `router.push({ query: route.query })`，以保留 SSO ticket 参数
- 移动端路由 path 名称形如 `index_phone.cpt`

### 主题系统

- CSS 变量定义在 `src/assets/styles/main.css` 的 `:root` / `[data-theme='theme-dark']` / `[data-theme='theme-light']`
- 通过设置 `<html>` 的 `data-theme` 属性切换主题
- 默认主题为 `theme-dark`
- 图表配色：`--chart-1` 至 `--chart-8`

### 组件规范

- 使用 `<script setup lang="ts">` 并配合 `defineOptions({ name: '...' })`
- Props：`withDefaults(defineProps<{...}>(), {...})`
- Emits：`defineEmits<{ eventName: [args] }>()`
- 样式使用 scoped + CSS 自定义属性
- 自动刷新在 `onMounted` 中通过 `setInterval` 实现，并在 `onBeforeUnmount` 中清除
- 异步内容使用 loading 骨架屏，无数据时展示空状态

## 关键说明

- **SSO 登录**：系统通过 `bw.sso.sdk.js` 与 `mine_key` 查询参数完成单点登录，入口逻辑位于 `src/main.ts` 与 `src/permission.ts`。
- **Token 与矿点身份**：`src/utils/auth.ts` 在 `localStorage` 中读写 `token`；`src/utils/cookie.ts` 从 cookie 读取矿点级值（`MineName`、`MineDesc`、`Access-Token`）。
- **Axios 拦截器**：所有请求设置 `caller: WebMineManage` 与 `token` 请求头，响应状态码行为见 `src/utils/request.ts`。
- **设计系统**：详见 `design-system/MASTER.md` 与 `design-system/pages/`。
