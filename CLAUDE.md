# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server (port 8080, host 0.0.0.0) |
| `pnpm build` | Type check (`vue-tsc --noEmit`) + production build |
| `pnpm build:prod` | Production build only (skip type check) |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run all Playwright E2E tests |
| `pnpm test:ui` | Run Playwright tests with UI mode |
| `pnpm lint` | ESLint auto-fix in `src/` |

## Architecture Overview

### Tech Stack
- **Framework**: Vue 3.5 + Composition API + `<script setup lang="ts">`
- **Build**: Vite 6 + TypeScript 5.6 + pnpm 10
- **UI**: Element Plus 2.9 (PC) + Vant 4.9 (Mobile)
- **State**: Pinia 2.3 (setup stores with `defineStore('name', () => {...})`)
- **Router**: Vue Router 4.5 with `createWebHistory('/WebMineManage')`
- **Charts**: ECharts 5 + vue-echarts 7
- **HTTP**: Axios 1.7 with interceptors
- **Testing**: Playwright 1.60 (Chromium + Mobile Chrome)
- **Auto-imports**: `unplugin-auto-import` for vue/vue-router/pinia APIs

### SSO Login Flow
1. Vite plugin `vite-plugin/injectSsoSdk.ts` injects `<script src="/net/Content/Resource/SDK/bw.sso.sdk.js">` into HTML
2. `src/utils/sso.ts` → `bwSSOSDKLogin(callback)` is called in `main.ts` before app mount
3. Checks `mine_key` query param → if present, decodes with js-base64 and calls `userStore.Login()`
4. If `BW_SSO_SDK` global is available, calls `SSOLogin(hostname, port, callback)`
5. All paths call `callback()` so Vue app always mounts (with console.warn on failures)
6. Route guard in `src/permission.ts` handles mine_key auto-login and token validation

### Strategy API Pattern
All backend data fetching uses a unified strategy pattern:
- **`requestStrategyData(id, params, 'data')`** → `POST /api/PoininfoSmartValid/GetStrategyData`
- **`requestStrategyData(id, params, 'page')`** → `POST /api/PoininfoSmartValid/GetPageStrategyData` (paginated)
- **`requestStrategyData(id, params, 'json')`** → `POST /api/PoininfoSmartValid/GetStrategyJsonData`
- **`executeStrategy(id, params)`** → `POST /api/PoininfoSmartValid/ExecuteStrategyCom`
- Each API module (e.g., `src/api/system/safetyMonitoring.ts`) calls these with numeric strategy IDs

### Theme System
- CSS variables on `:root` / `[data-theme='theme-dark']` / `[data-theme='theme-light']`
- Switched by setting `data-theme` attribute on `<html>` element
- Variables stored in `src/assets/styles/main.css` (single CSS entry point)
- Element Plus and Vant CSS variables overridden in the same file

### Route Structure
- All routes are `hidden: true` (no sidebar navigation)
- Routing via direct URL access with query parameters
- 30+ routes covering safety monitoring, mine pressure, production, personnel location
- Mobile routes have `app/` subdirectories; PC routes at view root
- 401 and 404 error pages at `/401` and `/:pathMatch(.*)*`

### Pinia Stores
| Store | File | Purpose |
|-------|------|---------|
| `app` | `src/stores/app.ts` | Sidebar state, isMobile, size, histPopup |
| `settings` | `src/stores/settings.ts` | Theme (dark/light) |
| `user` | `src/stores/user.ts` | Token, login action |

### Project Structure
```
src/
├── api/              # Strategy API modules (one file per domain)
│   ├── login.ts
│   └── system/       # safetyMonitoring, minePressure, production, etc.
├── assets/styles/    # Single main.css with CSS variables + overrides
├── components/       # Shared components (Pagination, Table, etc.)
│   ├── index.ts      # Barrel exports
│   └── */            # Each component has its own folder
├── router/index.ts   # All routes defined here
├── stores/           # Pinia stores
├── types/            # env.d.ts, global.d.ts (BW_SSO_SDK), auto-imports.d.ts
├── utils/            # request.ts (Axios), auth.ts, sso.ts, util.ts, constants.ts
├── views/            # Page views
│   ├── system/       # safetyMonitoring, minePressure, production...
│   ├── personnel_location/  # PC (root) + mobile (app/) subdirs
│   ├── dashboard/    # ECharts dashboard components
│   ├── error/        # 401, 404
│   └── login.vue
├── App.vue           # Root: checks device type + theme on mount
├── main.ts           # Entry: SSO → Pinia → Router → mount
├── permission.ts     # Route guard (mine_key login, token check)
vite-plugin/          # Custom Vite plugins
├── injectSsoSdk.ts   # Injects SSO SDK script tag
└── generateVersionJson.ts  # Generates dist/version.json on build
tests/
├── specs/            # Playwright test files
├── utils/            # mock.ts (SSO + API mock), setup.ts (custom fixture)
└── fixtures/         # Mock JSON data
```

### Component Pattern
- All components use `<script setup lang="ts">` with `defineOptions({ name: '...' })`
- Props typed with `withDefaults(defineProps<{...}>(), {...})`
- Emits typed with `defineEmits<{ eventName: [args] }>()`
- Scoped styles with CSS variables

### Vite Configuration
- **Base path**: `/WebMineManage` (matches production deployment)
- **Proxy**: `/net`, `/DigitizingMine`, `/cas`, `/bwmes-boot`, `/bwPublic` → `http://192.168.133.10:33382`
- **Build chunks**: `chunk-libs` (vue/router/pinia), `chunk-element-plus`, `chunk-vant`, `chunk-echarts`
- **Dev port**: 8080

### Testing Strategy
- Playwright with custom fixture in `tests/utils/setup.ts`
- Fixture auto-mocks `BW_SSO_SDK` and intercepts all API routes with realistic mock data
- Two projects: `chromium` (Desktop Chrome, zh-CN) and `mobile-chrome` (Pixel 5)
- WebServer configured to start Vite on port 8081 during tests
- Screenshots on failure, video retain-on-failure, trace on first retry
