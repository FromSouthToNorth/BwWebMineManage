# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server (host `0.0.0.0`, port `8080`) |
| `pnpm build` | Type check (`vue-tsc --noEmit`) + production build |
| `pnpm build:prod` | Production build only (skip type check) |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run all Playwright E2E tests |
| `pnpm test tests/specs/example.spec.ts` | Run a single test file |
| `pnpm test -g "test name"` | Run a single test by name |
| `pnpm test --project=chromium` | Run tests only on the desktop Chromium project |
| `pnpm test --project=mobile-chrome` | Run tests only on the mobile Chrome project |
| `pnpm test:ui` | Run Playwright tests with UI mode |
| `pnpm lint` | ESLint auto-fix in `src/` |

Environment variables are loaded via `.env.development` / `.env.production`:

- `VITE_APP_BASE_API` — API base path (default `/net`)
- `VITE_API_TARGET` — proxy target
  - Development: `http://192.163.5.10:33382`
  - Production: `http://192.168.133.110:33382`

## Architecture Overview

### Tech Stack
- **Framework**: Vue 3.5 + Composition API + `<script setup lang="ts">`
- **Build**: Vite 6 + TypeScript 5.6 + pnpm 10
- **UI**: Element Plus 2.9 (PC) + Vant 4.9 (Mobile)
- **State**: Pinia 2.3 (setup stores with `defineStore('name', () => {...})`)
- **Router**: Vue Router 4.5 with `createWebHistory('/WebMineManage')`
- **Charts**: ECharts 5.6 + vue-echarts 7 + zrender 6 (low-level canvas)
- **HTTP**: Axios 1.7 with interceptors
- **Utilities**: `@vueuse/core`, `js-base64`, `jsencrypt`, `fuse.js`, `sortablejs`, `file-saver`, `clipboard`
- **Auto-imports**: `unplugin-auto-import` for `vue`, `vue-router`, and `pinia` APIs (`src/types/auto-imports.d.ts`)
- **Testing**: Playwright 1.50+ (Chromium + Mobile Chrome)

### Module Alias
`vite.config.ts` resolves `@` to the `src/` directory. Use `@/components/...`, `@/utils/...`, etc. for all project imports.

### Global Components
`src/main.ts` globally registers the following components; use them in templates without importing:

- `Pagination`
- `SafetyMonitoringStatistics`
- `RightToolbar`
- `TopShow`
- `Setting`

Other shared components are imported via the barrel file `src/components/index.ts`.

### SSO Login Flow
1. `vite-plugin/injectSsoSdk.ts` injects `<script src="/net/Content/Resource/SDK/bw.sso.sdk.js">` into HTML.
2. `src/main.ts` calls `bwSSOSDKLogin(callback)` from `src/utils/sso.ts` **before** mounting the app.
3. `bwSSOSDKLogin` checks the URL for a `mine_key` query param; if present, it calls `callback()` immediately so the app mounts, and `src/permission.ts` handles the actual login.
4. If no `mine_key` and the `BW_SSO_SDK` global is available, it invokes `SSOLogin(hostname, port, callback)`.
5. If `BW_SSO_SDK` is unavailable and there is no `mine_key`, the function warns and returns **without** calling `callback()`; the app will not mount in that case.
6. `src/permission.ts` route guard processes `mine_key` auto-login, token validation, and SSO logout redirection.

### Strategy API Pattern

All backend data fetching uses a unified strategy pattern in `src/api/system/helpers.ts`:

- **`requestStrategyData(id, params, 'data')`** → `POST /api/PoininfoSmartValid/GetStrategyData`
- **`requestStrategyData(id, params, 'page')`** → `POST /api/PoininfoSmartValid/GetPageStrategyData` (paginated)
- **`requestStrategyData(id, params, 'json')`** → `POST /api/PoininfoSmartValid/GetStrategyJsonData`
- **`executeStrategy(id, params)`** → `POST /api/PoininfoSmartValid/ExecuteStrategyCom`

Each API module exports typed functions that call these helpers with numeric strategy IDs:

```ts
// src/api/system/bar.ts — strategy ID 1942 for category stats
export function getData() {
  return requestStrategyData(1942, [{ name: 'MineName', value: getMineName() }])
}
```

`getMineName()` reads from a cookie (`src/utils/cookie.ts`) and caches the result for the page lifecycle.

### Axios Interceptor Behavior (`src/utils/request.ts`)

All requests set the header `caller: WebMineManage` and carry the current token in the `token` header.

| Code | Behavior |
|------|----------|
| 100 / 200 | Success — resolves with `res.data` |
| 401 | Token expired — `ElMessageBox.confirm` → redirect to `/401` |
| 101 | Business error — `ElMessage.error(msg)` → rejects |
| 500 | Server error — `ElMessage.error(msg)` → rejects |
| Other | Shows error msg → rejects |
| HTTP error | Reads `response.data.mesg` first, falls back to network error |

`cleanMessage()` strips `:提示:`, `:错误:`, `:警告:`, `:信息:` labels from API messages while preserving numeric prefixes.

### Data Mapping Pattern

Components map raw API response fields to display fields consistently:

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

Always include the mapping step — never pass raw API objects to templates.

### ECharts + Composables Pattern

Reusable `useECharts` composable (`src/composables/useECharts.ts`):

```ts
const chartRef = ref<HTMLDivElement>()
const { chart, init, setOption, resize, dispose } = useECharts(chartRef)

async function initChart() {
  if (!init()) return
  setOption({ ...darkChartTheme(), ...chartOptions })
}
```

- `chart` is a `shallowRef`, so always use `chart.value` to access the instance.
- Always call `init()` before `setOption()` and guard with `if (!init()) return`.
- `darkChartTheme()` provides base dark-theme config (grid, textStyle, tooltip, axis defaults).
- The composable exposes `resize()` and `dispose()` but **does not call them automatically**; components must wire up their own `ResizeObserver`/`window.resize` listener and dispose in `onBeforeUnmount`.
- To click on empty chart areas (not just bars/series), use `chart.value.getZr()` (zrender) with `convertToPixel` segment calculation for Y-axis area clicks.
- Add `ResizeObserver` when segment-based click positions need recalculation on resize.

### Mobile / PC Dual-Mode Architecture

- **Mobile pages** live under `app/` subdirectories (e.g., `views/system/safetyMonitoring/app/`).
- **PC pages** live at the view root.
- Mobile uses Vant Tabbar navigation — manually implemented with `<nav>` + `router.push({ query: route.query })` to preserve SSO ticket params. Do NOT use Vant's `route` prop to avoid full-page SSO redirect.
- Mobile pages are wrapped with `<NavBar>` component (icon, title, subtitle, optional action slot).
- Mobile routes use path names like `index_phone.cpt`, `personnelLocation_phone.cpt`.

### Theme System
- CSS variables on `:root` / `[data-theme='theme-dark']` / `[data-theme='theme-light']`.
- Switched by setting `data-theme` attribute on the `<html>` element.
- Theme resolution on mount (`App.vue`): URL query param `theme` → `localStorage` → default `theme-dark`.
- All CSS in `src/assets/styles/main.css` (single entry point).
- Chart color palette: `--chart-1` through `--chart-8`.
- Z-index scale: `--z-content` (10), `--z-sticky` (20), `--z-overlay` (30), `--z-modal` (50), `--z-loading` (100).
- Font sizes: `--font-size-hero`, `--font-size-lg`, `--font-size-base`, `--font-size-sm`, `--font-size-xs`.
- Element Plus and Vant CSS variables overridden in the same file.
- Prefers-reduced-motion media query supported.

### Pinia Stores

| Store | File | Purpose |
|-------|------|---------|
| `app` | `src/stores/app.ts` | Sidebar state, isMobile, size, histPopup |
| `settings` | `src/stores/settings.ts` | Theme (dark/light) |
| `user` | `src/stores/user.ts` | Token, login action |

### Vite Configuration
- **Base path**: `/WebMineManage` (matches production deployment).
- **Proxy**: `/net`, `/DigitizingMine`, `/cas`, `/bwmes-boot`, `/bwPublic` → target from `VITE_API_TARGET`.
- **Build chunks**: `chunk-libs` (vue/router/pinia), `chunk-element-plus`, `chunk-vant`, `chunk-echarts`.
- **Production**: terser minification (drop console/debugger), output to `dist/WebMineManage/`.
- **SCSS**: modern-compiler API enabled.
- **Custom plugins**: `injectSsoSdk`, `generateVersionJson` in `vite-plugin/`.

### Project Structure

```
src/
├── api/system/          # API modules, each with typed functions + strategy IDs
│   └── helpers.ts       # requestStrategyData(), executeStrategy(), getMineName()
├── assets/styles/       # Single main.css with CSS variables + component overrides
├── components/          # Shared components (one folder per component)
│   ├── index.ts         # Barrel exports
│   ├── SafetyMonitoringTable/  # PC (root) + mobile (app/) versions
│   ├── TimerAlarmTable/        # PC (root) + mobile (app/) versions
│   ├── KpiBar/          # Generic KPI metric bar
│   ├── StatusBadge/     # Status indicator (dot/badge/text, 5 states)
│   ├── GlassCard/       # Glass-morphism card container
│   ├── NavBar/          # Enhanced nav bar with icon/subtitle/actions
│   └── …                # Pagination, Hamburger, BackToTop, Setting, etc.
├── composables/         # useECharts.ts (chart lifecycle, dark theme, zrender click)
├── router/index.ts      # All routes in one file, all hidden (no sidebar nav)
├── stores/              # Pinia (app, settings, user)
├── types/               # env.d.ts, global.d.ts (BW_SSO_SDK type), auto-imports.d.ts
├── utils/               # request.ts (axios), auth.ts, sso.ts, cookie.ts, errorCode.ts
├── views/               # Page views
│   ├── system/          # safetyMonitoring, minePressure, production, appAlarmList...
│   ├── dashboard/       # BarChart, AppCharts, minePressure charts, production charts
│   ├── personnel_location/  # PC (root) + mobile (app/) subdirs
│   └── error/           # 401, 404
├── App.vue              # Root: device type detection + theme on mount
├── main.ts              # Entry: SSO → Pinia → Router → mount
└── permission.ts        # Route guard (mine_key login, token validation)

vite-plugin/             # Custom Vite plugins
tests/
├── specs/               # Playwright test files
├── utils/               # mock.ts (SSO + API mock fixture), setup.ts (custom fixture)
└── fixtures/            # Mock JSON data
design-system/           # Hierarchical design system docs
├── MASTER.md            # Global design rules
├── guidelines-supplement.md  # ECharts guide, UX patterns, Vue implementation
└── pages/               # Page-specific overrides
```

### Component Patterns
- All components use `<script setup lang="ts">` with `defineOptions({ name: '...' })`.
- Props typed with `withDefaults(defineProps<{...}>(), {...})`.
- Emits typed with `defineEmits<{ eventName: [args] }>()`.
- Scoped styles with CSS custom properties.
- Auto-refresh via `setInterval` in `onMounted`, cleared in `onBeforeUnmount`.
- Loading skeletons for async content, empty state for zero-data.

### Testing Strategy
- Playwright with custom fixture in `tests/utils/setup.ts`.
- Fixture auto-mocks `BW_SSO_SDK` and intercepts API routes with realistic mock data.
- Two projects: `chromium` (Desktop Chrome, `zh-CN`) and `mobile-chrome` (Pixel 5).
- WebServer configured to start Vite on port `8081` during tests (`node ./node_modules/vite/bin/vite.js --port 8081`).
- Screenshots on failure, video retain-on-failure, trace on first retry.

### Design System
The `design-system/` directory contains a hierarchical design system:
- `MASTER.md` — Global Source of Truth (CSS variable inventory, color palettes, typography scale, z-index system, component specs, chart rules, accessibility).
- `pages/<name>.md` — Page-specific overrides that take precedence over `MASTER.md`.
- Always reference these files when designing new UI or modifying existing styles.
