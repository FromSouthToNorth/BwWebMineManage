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

- Vue 3.5 + Composition API + `<script setup lang="ts">`
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

### PC + Mobile Dual Mode

- PC pages live at the view root, e.g. `views/system/safetyMonitoringMore/index.vue`.
- Mobile pages are either:
  - `app/` sub-directory, e.g. `views/system/safetyMonitoring/app/index.vue` or `components/SafetyMonitoringTable/app/index.vue`
  - `app.vue` sibling, e.g. `views/system/safetyMonitoringMore/app.vue`
- Mobile routes use path names like `index_phone.cpt` / `personnelLocation_phone.cpt`.
- Mobile tab bars are hand-rolled `<nav>` + `router.push({ query: route.query })` to preserve SSO ticket query params. Do **not** use Vant Tabbar's `route` prop.
- Mobile pages are wrapped in the `<NavBar>` component.

### Global Components

`src/main.ts` globally registers: `Pagination`, `SafetyMonitoringStatistics`, `RightToolbar`, `TopShow`, `Setting`. These can be used in templates without importing. Other shared components are imported via the barrel file `src/components/index.ts`.

### SSO Login Flow

1. `vite-plugin/injectSsoSdk.ts` injects `<script src="/net/Content/Resource/SDK/bw.sso.sdk.js">`.
2. `src/main.ts` calls `bwSSOSDKLogin(callback)` from `src/utils/sso.ts` before mounting.
3. If URL contains `mine_key`, it calls `callback()` immediately; actual login is handled by `src/permission.ts`.
4. Otherwise, if `BW_SSO_SDK` exists globally, it calls `SSOLogin(hostname, port, callback)`.
5. If neither SDK nor `mine_key` is available, it warns and does **not** call `callback()`, so the app does not mount.
6. `src/permission.ts` route guard handles `mine_key` auto-login, token validation, and SSO logout redirect. It is dynamically imported in `main.ts` after Pinia is installed because it depends on the `user` store.

### Identity & Tokens

- `src/utils/auth.ts` reads/writes the user `token` in `localStorage` for Axios and the `user` store.
- `src/utils/cookie.ts` reads mine-level values (`MineName`, `MineDesc`, `Access-Token`) from cookies with a `localStorage` fallback under the `pro__` namespace.

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

`getMineName()` reads from `src/utils/cookie.ts` and caches the result for the page lifetime.

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

`dayjs` is centralized in `src/utils/util.ts`. Use `formatDateTime()` and `getRecentDayRange()` from there; do not import `dayjs` directly in components.

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
- Custom plugins:
  - `injectSsoSdk` — injects BW SSO SDK script.
  - `generateVersionJson` — writes `dist/<VITE_APP_PATH>/version.json` at the end of production build using `VITE_APP_VERSION` and `VITE_APP_PATH`.

### Component Conventions

- Use `<script setup lang="ts">` with `defineOptions({ name: '...' })`.
- Props: `withDefaults(defineProps<{...}>(), {...})`.
- Emits: `defineEmits<{ eventName: [args] }>()`.
- Styles: scoped + CSS custom properties.
- Auto-refresh in `onMounted` via `setInterval`, cleared in `onBeforeUnmount`.
- Show loading skeletons for async content and empty states for no data.

### Testing

Playwright uses a custom fixture in `tests/utils/setup.ts` that mocks `BW_SSO_SDK` and intercepts API routes with mock data. Two projects: `chromium` (desktop) and `mobile-chrome` (Pixel 5). WebServer runs Vite on port `8081` during tests; tests use `baseURL: http://localhost:8081` while dev runs on `8080`. Screenshots, videos, and traces are retained on failure/first retry.

### Design System

`design-system/` contains a hierarchical design system:

- `MASTER.md` — global source of truth (CSS variables, palette, typography, z-index, component rules, chart rules, accessibility).
- `pages/<name>.md` — page-level overrides with higher priority than `MASTER.md`.

Reference these when designing or modifying UI.
