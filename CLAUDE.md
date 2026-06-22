# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server on `0.0.0.0:8080` |
| `pnpm build` | Type-check (`vue-tsc --noEmit`) + production build |
| `pnpm build:prod` | Production build without type-checking |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run all Playwright E2E tests |
| `pnpm test tests/specs/example.spec.ts` | Run single test file |
| `pnpm test -g "test name"` | Run test by name |
| `pnpm test --project=chromium` | Desktop Chromium project only |
| `pnpm test --project=mobile-chrome` | Mobile Chrome project only |
| `pnpm test:ui` | Run Playwright in UI mode |
| `pnpm lint` | Auto-fix ESLint issues in `src/` |

> **Note:** The project depends on ESLint v9 but currently has no `eslint.config.(js|mjs|cjs)` file, so `pnpm lint` will fail until a config is added.

Environment variables are loaded from `.env.development` / `.env.production`:

- `VITE_APP_BASE_API` — API base path (default `/net`)
- `VITE_API_TARGET` — Proxy target
  - Development: `http://192.163.5.10:33382`
  - Production: `http://192.168.133.110:33382`

## High-Level Architecture

### Tech Stack

- Vue 3.5 + Composition API + `<script setup lang="ts">` (most pages)
- Vite 6 + TypeScript 5.6 + pnpm 10
- Element Plus 2.9 (PC, default size `small`, `zh-CN`) + Vant 4.9 (mobile)
- Pinia 2.3 (setup-style stores)
- Vue Router 4.5 with `createWebHistory('/WebMineManage')`
- ECharts 5.6 + vue-echarts 7 + zrender 6
- Axios 1.7
- Playwright 1.50+ (Chromium + Mobile Chrome)

`unplugin-auto-import` imports `vue`, `vue-router`, and `pinia` APIs automatically; the declaration file is `src/types/auto-imports.d.ts`.

### Module Alias

`vite.config.ts` maps `@` to `src/`. Always use `@/components/...`, `@/utils/...`, etc.

### Views / Route Structure

Routes are split between PC and mobile in `src/router/index.ts`:

| Path | Type | Component |
|---|---|---|
| `/index.cpt` | PC | Safety monitoring dashboard |
| `/safetyMonitoringMore` | PC | Expanded safety monitoring |
| `/statisticalGraph` | PC | Charts & statistics |
| `/minePressure` | PC | Mine pressure monitoring |
| `/yieldMonitor` | PC | Yield monitoring |
| `/production` | PC | Production monitoring |
| `/personnelLocation.cpt` | PC | Personnel location main |
| `/index_phone.cpt` | Mobile (4 child routes) | Safety, real-time alerts, charts |
| `/personnelLocation_phone.cpt` | Mobile (11 child routes) | Personnel location mobile |

Most system views are at `src/views/system/<module>/index.vue`. Personnel location has the most complex routing with parameterized paths like `/downholepersonNum/:year/:month/:day/:total`.

### PC + Mobile Dual Mode

- PC pages live at the view root, e.g. `views/system/safetyMonitoringMore/index.vue`.
- Mobile pages are either:
  - `app/` sub-directory, e.g. `views/system/safetyMonitoring/app/index.vue` or `components/SafetyMonitoringTable/app/index.vue`
  - `app.vue` sibling, e.g. `views/system/safetyMonitoringMore/app.vue`
- Mobile routes use path names like `index_phone.cpt` / `personnelLocation_phone.cpt`.
- Mobile tab bars are hand-rolled `<nav>` + `router.push({ query: route.query })` to preserve SSO ticket query params. Do **not** use Vant Tabbar's `route` prop.
- Mobile pages are wrapped in the `<NavBar>` component.

### Global Components

`src/main.ts` globally registers: `Pagination`, `SafetyMonitoringStatistics`, `RightToolbar`, `TopShow`, `Setting`. These can be used in templates without importing. Other shared components are imported via the barrel file `src/components/index.ts`, which exports: `NavBar`, `KpiBar`, `KpiSection`, `StatusBadge`, `GlassCard`, `Hamburger`, `BackToTop`, `SafetyMonitoringTable`, `TimerAlarmTable`.

### SSO Login Flow

1. `vite-plugin/injectSsoSdk.ts` injects `<script src="/net/Content/Resource/SDK/bw.sso.sdk.js">`.
2. `src/main.ts` calls `bwSSOSDKLogin(callback)` from `src/utils/sso.ts` before mounting.
3. If URL contains `mine_key`, it calls `callback()` immediately; actual login is handled by `src/permission.ts`.
4. Otherwise, if `BW_SSO_SDK` exists globally, it calls `SSOLogin(hostname, port, callback)`.
5. If neither SDK nor `mine_key` is available, it warns and does **not** call `callback()`, so the app does not mount.

### Route Guard (`src/permission.ts`)

The `router.beforeEach` guard handles three scenarios:
1. **`mine_key` in query** — Base64-decodes a credential string `username;password`, calls `userStore.Login()`, then redirects to the original path without the key.
2. **Has token** (from cookie `Access-Token`) — allows navigation.
3. **Neither** — calls `BW_SSO_SDK.SSOLogout()` to redirect to the SSO login page.

`permission.ts` is dynamically imported in `main.ts` after Pinia is installed because it depends on the `user` store.

### Identity & Tokens

- `src/utils/auth.ts` reads/writes the user `token` in `localStorage` for Axios and the `user` store.
- `src/utils/cookie.ts` reads mine-level values (`MineName`, `MineDesc`, `Access-Token`) from cookies with a `localStorage` fallback under the `pro__` namespace.

### App.vue Entry Point

`src/App.vue` does two things on mount:
1. **Theme resolution** — checks URL `data-theme` query → `localStorage` → default `theme-dark`. Sets the attribute on `<html>` and syncs to Pinia `settingsStore`.
2. **Device detection** — checks `navigator.userAgent` for mobile patterns, sets `appStore.setIsMobile()` and dynamic Element Plus `size` based on viewport height.

### Strategy API Pattern

All backend requests go through `src/api/system/helpers.ts`:

- `requestStrategyData(id, params, 'data')` → `POST /api/PoininfoSmartValid/GetStrategyData`
- `requestStrategyData(id, params, 'page')` → `POST /api/PoininfoSmartValid/GetPageStrategyData` (paginated)
- `requestStrategyData(id, params, 'json')` → `POST /api/PoininfoSmartValid/GetStrategyJsonData`
- `executeStrategy(id, params)` → `POST /api/PoininfoSmartValid/ExecuteStrategyCom`

API modules export typed functions that call these helpers with numeric strategy IDs:

```ts
// src/api/system/bar.ts — strategy ID 1942, used for category statistics
import { requestStrategyData, getMineName } from './helpers'

export function getData() {
  return requestStrategyData(1942, [{ name: 'MineName', value: getMineName() }])
}
```

`getMineName()` reads from `src/utils/cookie.ts` and caches the result for the page lifetime. Parameters follow the `{ name: string, value: string | number }` shape (`StrategyParam` type).

Backend response format and error message format are documented in `api.md`.

### Axios Interceptor Behavior (`src/utils/request.ts`)

Every request sets headers `caller: WebMineManage` and `token` (from `src/utils/auth.ts`).

| Code | Behavior |
|---|---|
| 100 / 200 | Success — returns `res.data` |
| 401 | Token expired — `ElMessageBox.confirm` then redirect to `/401` |
| 101 | Business error — `ElMessage.error(msg)` then reject |
| 500 | Server error — `ElMessage.error(msg)` then reject |
| Other | Show error message then reject |
| HTTP error | Prefer `response.data.mesg`; otherwise return network error |

`cleanMessage()` strips tags like `:提示:`, `:错误:`, `:警告:`, `:信息:` while preserving leading numbers.

### Data Mapping Convention

Components must map raw API fields to display fields before passing them to templates. Never pass raw API objects directly to templates.

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

### Date Handling

`dayjs` is centralized in `src/utils/util.ts`. Use `formatDateTime()` and `getRecentDayRange()` from there; do not import `dayjs` directly in components. Personnel location's `downholeInfoJs.ts` previously had duplicate `formatterDate`/`getCurrDateTime`/`getInitDate` — these have been removed; always use the `util.ts` versions.

### KPI Constants

KPI metadata (labels, icons, colors, top-bar priorities) is centralized in `src/constants/kpi.ts` and exported as `KPI_LIST`, `KPI_CONFIG`, and `TOP_KPI_KEYS`. Shared components such as `KpiSection` consume this config directly.

### ECharts + Composables Pattern

Use `src/composables/useECharts.ts` for chart lifecycle:

```ts
const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

async function initChart() {
  if (!init()) return
  setOption({ ...darkChartTheme(), ...chartOptions })
}
```

- `chart` is a `shallowRef`; access the instance via `chart.value`.
- Always call `init()` before `setOption()` and guard with `if (!init()) return`.
- `darkChartTheme()` provides the dark-theme base (grid, textStyle, tooltip, axis defaults).
- The composable exposes `resize()` and `dispose()` but does **not** call them automatically. Components must wire up `ResizeObserver` / `window.resize` and call `dispose()` in `onBeforeUnmount`.
- For clicks on chart blank areas (not just series), use `chart.value.getZr()` and `convertToPixel` with segment-based Y-axis calculations; recalculate on resize via `ResizeObserver`.
- Personnel location charts use inline ECharts inits in `src/views/personnel_location/downholeInfoJs.ts` (separate pattern — see below).

### Theme System

- CSS variables live in `src/assets/styles/main.css` under `:root`, `[data-theme='theme-dark']`, and `[data-theme='theme-light']`.
- Theme resolution runs in `App.vue` on mount: URL `theme` query → `localStorage` → default `theme-dark`.
- Chart colors: `--chart-1` … `--chart-8`.
- Z-index scale: `--z-content` (10), `--z-sticky` (20), `--z-overlay` (30), `--z-modal` (50), `--z-loading` (100).
- Font sizes: `--font-size-hero`, `--font-size-lg`, `--font-size-base`, `--font-size-sm`, `--font-size-xs`.
- Element Plus and Vant CSS variables are also overridden in the same file.
- Respects `prefers-reduced-motion`.

### Pinia Stores

| Store | File | Purpose |
|---|---|---|
| `app` | `src/stores/app.ts` | Sidebar state, `isMobile`, size, `histPopup` |
| `settings` | `src/stores/settings.ts` | Theme (dark/light) |
| `user` | `src/stores/user.ts` | Token, login actions |

### Vite Configuration Notes

- Base path: `/WebMineManage` (matches production deploy and `createWebHistory`).
- Dev server: `host: '0.0.0.0'`, `port: 8080`.
- Proxies: `/net`, `/DigitizingMine`, `/cas`, `/bwmes-boot`, `/bwPublic` → `VITE_API_TARGET`.
- Manual chunks: `chunk-libs`, `chunk-element-plus`, `chunk-vant`, `chunk-echarts`.
- Production build: terser with `drop_console` and `drop_debugger`, output to `dist/WebMineManage/`.
- SCSS uses the modern-compiler API.
- Custom plugins in `vite-plugin/`:
  - `injectSsoSdk.ts` — injects BW SSO SDK script.
  - `generateVersionJson.ts` — writes `dist/<VITE_APP_PATH>/version.json` at the end of production build using `VITE_APP_VERSION` and `VITE_APP_PATH`.

### Component Conventions (main system)

- Use `<script setup lang="ts">` with `defineOptions({ name: '...' })`.
- Props: `withDefaults(defineProps<{...}>(), {...})`.
- Emits: `defineEmits<{ eventName: [args] }>()`.
- Styles: scoped + CSS custom properties.
- Auto-refresh in `onMounted` via `setInterval`, cleared in `onBeforeUnmount`.
- Show loading skeletons for async content and empty states for no data.

### Personnel Location Module (legacy migration)

The personnel location module (`src/views/personnel_location/`, `src/components/personnelLocation/`) was migrated from a Vue 2 project (`D:\bw\Bw.WebMineManage`) and uses a **different pattern** from the rest of the codebase:

- **Options API** (`export default { data() {...}, methods: {...} }`) — not `<script setup lang="ts">`.
- **Shared composable** — table/pagination state is provided by `usePersonnelLocation()` from `src/composables/usePersonnelLocation.ts`. Popup components use it via `setup()`: `const { showPopup, table, selectionChange, pageFieldConvert, addDefaultParam } = usePersonnelLocation()`. The composable exposes `table` state (dataSource, total, pageNo, pageSize, loading, queryParam) and helper functions; `search`/`pageChange` methods must be defined in each consuming component.
- **Scoped styles** via `.personnel-page` class to prevent style leakage to other pages.
- **CSS variables** prefixed `--pl-*` or aliased in `main.css` under `:root` (global, but most are only referenced inside `.personnel-page` selectors). Light theme overrides at `html[data-theme='theme-light']`.
- **Inline ECharts** — chart init functions live in `src/views/personnel_location/downholeInfoJs.ts` (not `useECharts` composable), using module-level variables (`myChartBar`, `myChartLine`) and manual resize listeners. Module now written in TypeScript with typed interfaces.
- **Chart container guard** — must check `clientWidth > 0 && clientHeight > 0` before `echarts.init()` or it fails silently.

When editing personnel location files, match the existing style (Options API, composable setup pattern) rather than converting to Composition API piecemeal.

### Dialog / Popup Pattern (personnel location)

Personnel location uses a child-ref dialog pattern:

```vue
<trackInfoPopup ref="trackInfoPopup"></trackInfoPopup>
<userInfoPopup ref="userInfoPopup"></userInfoPopup>

<script>
// Open from parent:
this.$refs.trackInfoPopup.show(row)
</script>
```

Two dialog approaches exist:
- **Direct `el-dialog`** — `userInfoPopup.vue` uses `<el-dialog append-to-body>` directly.
- **Wrapped `trajectoryQuery.vue`** — most popups (`downUserNumInfoPopup`, `deviceStatePopup`, etc.) use `<Popup>` which wraps `el-dialog`. It accepts `:appendToBody` prop (default `false`) and uses `v-model` + `:isShow` prop for visibility control.

Key rules:
- Always set `append-to-body` on dialogs inside flex/scroll containers to avoid stacking-context clipping.
- Scoped `::v-deep` styles don't affect dialogs with `append-to-body` (they're moved outside the component). Use a non-scoped `<style>` block for dialog appearance, scoping selectors to avoid global leakage.
- Dialog CSS variables (`--popup-bgColor`, `--popup-textColor`, `--user-popup-*`) are defined in `main.css` at `:root` with `html[data-theme='theme-light']` overrides.

### API Modules

| File | Module | Notable IDs |
|---|---|---|
| `safetyMonitoring.ts` | 安全监测 | Recent alarm records |
| `newSafetyMonitoring.ts` | 新版安全监测 | Area/deviation/pressure |
| `minePressure.ts` | 矿压监测 | 1942–1987 range |
| `personnelLocation.ts` | 人员定位 | ~30 functions, IDs 5259–6748 |
| `production.ts` | 生产监控 | Production metrics |
| `yieldMonitor.ts` | 产量监测 | Yield data |
| `statisticalGraph.ts` | 统计图表 | Aggregate queries |
| `appAlarm.ts` | 移动端报警 | Mobile alarm lists |
| `ealTimeAlarm.ts` | 实时报警 | Real-time alarms |
| `bar.ts` | 柱状图数据 | 1942 category stats |
| `mine.ts` | 矿井信息 | Mine-level queries |
| `helpers.ts` | 策略 API 辅助 | Shared helpers + `getMineName()` |

### Testing

Playwright uses a custom fixture in `tests/utils/setup.ts` that mocks `BW_SSO_SDK` and intercepts API routes with mock data. Two projects: `chromium` (desktop) and `mobile-chrome` (Pixel 5). WebServer runs Vite on port `8081` during tests; tests use `baseURL: http://localhost:8081` while dev runs on `8080`. Screenshots, videos, and traces are retained on failure/first retry.

### Pagination Component

Use the globally registered `<Pagination>` component (`src/components/Pagination/index.vue`) for all paged tables:
- Props: `total`, `page`, `limit`, `pageSizes`, `layout`, `small`, `hidden` (hides when total is 0)
- Event: `@pagination="{ page, limit }"`
- Personnel location's `tableComponent.vue` uses this component internally

### Table Component (Personnel Location)

`src/components/personnelLocation/tableComponent.vue` (`BaseTable`) is the shared table wrapper used by all personnel-location views:
- Supports selection, index, sort, column slots (action buttons + "更多" dropdown)
- Emits `tableUpdate` with `{ currentPage, pageSize }` on page/size changes
- Column configs are typed via `ColumnConfig` interface in `src/components/personnelLocation/config/tableColumns.ts`
- Uses centralized `Pagination` component (not inline `el-pagination`)
- Avoid `el-icon-*` CSS classes — they don't work in Element Plus Vue 3. Use inline SVGs instead.

### Design System

`design-system/` contains a hierarchical design system:

- `MASTER.md` — global source of truth (CSS variables, palette, typography, z-index, component rules, chart rules, accessibility).
- `pages/<name>.md` — page-level overrides for specific modules (`safetyMonitoring.md`, `personnelLocation.md`, `minePressure.md`, `dashboard.md`).
- `guidelines-supplement.md` — supplementary design guidelines.

Reference these when designing or modifying UI.
