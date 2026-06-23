# 策略 API 接口文档

> 最后更新：2026-06-23

## 1. 架构概述

```
src/api/system/helpers.ts          ← 核心：requestStrategyData / executeStrategy
  ├── statisticalGraph.ts          ← 统计图表（1978–1984, 2592, 2702, 2704, 3229）
  ├── production.ts                ← 生产监控（1978–1984, 2592, 3230–3231）
  ├── bar.ts                       ← 分类统计柱状图（1942）
  ├── safetyMonitoring.ts          ← 安全监测（1938, 1940, 1947, 1954, 1961, 1964, 1965, 8453）
  ├── newSafetyMonitoring.ts       ← 新版安全监测（3362, 3364, 3365）
  ├── ealTimeAlarm.ts              ← 实时报警（1960, 1963）
  ├── appAlarm.ts                  ← 移动端报警（1920）
  ├── minePressure.ts              ← 矿压监测（1989–1992, 2591）
  ├── yieldMonitor.ts              ← 产量监测（2249, 2382, 2383, 4035）
  ├── personnelLocation.ts         ← 人员定位（5285, 5400, 6726, 6748 + 动态 ID）
  └── mine.ts                      ← 矿井信息（非策略 API，走 /api/Mine/GetCurrentMine）

src/utils/
  ├── request.ts                   ← Axios 实例 + 拦截器 + 错误处理
  ├── auth.ts                      ← Token 管理（localStorage）
  ├── cookie.ts                    ← Cookie 解析（MineName、Access-Token）
  └── errorCode.ts                 ← HTTP 错误码 → 中文消息
```

---

## 2. 后端端点

所有策略 API 均为 **POST** 请求，公共基础路径由 `VITE_APP_BASE_API` 环境变量指定（默认 `/net`）。

| 辅助函数 | URL | 用途 |
|---|---|---|
| `requestStrategyData(id, params, 'data')` | `/api/PoininfoSmartValid/GetStrategyData` | 通用数据查询 |
| `requestStrategyData(id, params, 'page')` | `/api/PoininfoSmartValid/GetPageStrategyData` | 分页数据查询 |
| `requestStrategyData(id, params, 'json')` | `/api/PoininfoSmartValid/GetStrategyJsonData` | JSON 格式数据 |
| `executeStrategy(id, params)` | `/api/PoininfoSmartValid/ExecuteStrategyCom` | 执行策略命令 |

### 请求体格式

```json
{
  "id": 1942,
  "parameter": [
    { "name": "MineName", "value": "骆驼山煤矿" }
  ]
}
```

### 参数类型定义

```typescript
// src/api/system/helpers.ts
interface StrategyParam {
  name: string   // 参数名，必须与后端 SQL 变量名完全匹配（大小写敏感）
  value: string | number
}

interface StrategyResponse<T = any> {
  code: number
  data: T
  mesg?: string
}
```

---

## 3. 后端响应格式

### 成功响应（code = 100）

```json
{
  "code": 100,
  "data": {
    "total": 2,
    "items": [
      {
        "devLabel": "014D09",
        "devAddress": "150114高抽巷掘进面主用风机一级局部通风机",
        "devType": "开关量",
        "categoryName": "局扇",
        "categoryStateText": "0态报警",
        "alarmType": "0态报警",
        "valueUpdateDT": "2026-05-30 17:51:13.000",
        "alarmBeginDT": "2026-05-30 17:51:13.000",
        "unit": null,
        "valueText": "停"
      }
    ],
    "pageIndex": 0
  },
  "timestamp": 1781234403980
}
```

### 业务错误响应（code = 101）

```json
{
  "code": 101,
  "mesg": "1990:提示:列名 'AreaName' 无效。",
  "mesgInfo": { "level": 16 },
  "timestamp": 1781234329439
}
```

### Axios 拦截器处理规则

| 状态码 | 行为 |
|---|---|
| `100` / `200` | 成功 — 返回 `res.data` |
| `101` | 业务错误 — `ElMessage.error(msg)` 后 reject |
| `401` | Token 过期 — `ElMessageBox.confirm` 后重定向 `/401` |
| `500` | 服务端错误 — `ElMessage.error(msg)` 后 reject |
| HTTP 错误 | 优先使用 `response.data.mesg`，否则返回网络错误 |

错误消息会自动清理（移除 `:提示:`、`:错误:`、`:警告:`、`:信息:` 等分类标签）。

---

## 4. 三个端点的使用场景

| 端点 | 典型场景 | 分页参数 |
|---|---|---|
| `data` | 简单数据查询、下拉框选项、图表数据 | 不需要分页 |
| `page` | 列表分页查询 | `StartRow`、`PageRowNums` |
| `json` | 复杂参数负载、时间序列数据、动态条件 | `Page`、`Row`（人员定位） |

---

## 5. 策略 ID 完整清单

### 5.1 安全监测（safetyMonitoring.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 1938 | data | `substationSelect()` | MineName |
| 1940 | data | `typeSelect()` | MineName |
| 1947 | data | `categorySelect(typeName?)` | MineName, CmbDevType |
| 1954 | page | `listSafetyMonitoring(query)` | StartRow, PageRowNums, style, MineName, AlarmType, Station, DevType, CategoryName, Area, Address |
| 1961 | data | `areaSelect()` | MineName |
| 1964 | data | `siteSelect()` | MineName |
| 1964 | data | `substationInfo(devLabel)` | MineName, DevLabel |
| 1965 | data | `getSafetyMonitoringTotal(query)` | MineName, IsCallThePolice |
| 1965 | data | `monitoringPointInfo(devLabel)` | MineName, DevLabel |
| 8453 | data | `getKpiData()` | MineName |

### 5.2 实时报警（ealTimeAlarm.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 1960 | page | `listEalTimeAlarm()` | MineName, StartRow=1, PageRowNums=10 |
| 1960 | page | `listMoreEalTimeAlarm(query)` | MineName, StartRow, PageRowNums |
| 1963 | page | `listHistoricalAlarm(query)` | MineName, StartRow, PageRowNums, Address, DevType, CategoryName, startTime, endTime |

### 5.3 移动端报警（appAlarm.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 1920 | json | `listAppAlarm(query)` | startTs, endTs, severity, pageSize, startRow |

### 5.4 新版安全监测（newSafetyMonitoring.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 3362 | data | `stationInfoList()` | MineName |
| 3364 | data | `stationChildrenList(query)` | MineName, StationId |
| 3365 | page | `stationInfoRightList(query)` | MineName, StartRow, PageRowNums |

### 5.5 矿压监测（minePressure.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 1989 | data | `installNameSelect()` | MineName |
| 1990 | page | `listMinePressure(query)` | MineName, AreaName, StartRow, PageRowNums, type |
| 1991 | data | `getAlarmValue(installSiteName)` | AreaName |
| 1992 | data | `getHistoryData(query)` | MineName, type, AreaName |
| 2591 | data | `getDyna()` | MineName |

### 5.6 统计图表（statisticalGraph.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 1978 | data | `deiveceClassSelect()` | MineName |
| 1979 | data | `deiviceNameSelect(query)` | MineName, DeiviceClassfy |
| 1980 | data | `maxTime(query)` | MineName, DeiviceName |
| 1981 | data | `getAnnularData(query)` | MineName, DeiviceName, CountDate |
| 1982 | data | `yesterdayData(query)` | MineName, DeiviceName |
| 1983 | data | `todayData(query)` | MineName, DeiviceName |
| 1984 | data | `yearsYieldContrast(query)` | MineName, DeiviceName, CountDate |
| 2592 | data | `everydayYield(query)` | MineName, DeiviceName, CountDate |
| 2702 | data | `omnData()` | MineName |
| 2704 | data | `beltSelect()` | MineName（硬编码"骆驼山选煤厂"） |
| 3229 | data | `omnData2()` | MineName |

### 5.7 生产监控（production.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 1978 | data | `deiveceClassSelect()` | MineName |
| 1979 | data | `deiviceNameSelect(query)` | MineName, DeiviceClassfy |
| 1980 | data | `maxTime(query)` | MineName, DeiviceName |
| 1981 | data | `annularChartData(query)` | MineName, DeiviceName, CountDate |
| 1982 | data | `Yesterdaysdata(query)` | MineName, DeiviceName |
| 1983 | data | `Todaysdata(query)` | MineName, DeiviceName |
| 1984 | data | `yearsYieldContrast(query)` | MineName, DeiviceName, CountDate |
| 2592 | data | `everydayYield(query)` | MineName, DeiviceName, CountDate |
| 3230 | data | `recentYearsData(query)` | MineName, DeiviceName |
| 3231 | data | `instantFlow(query)` | MineName, DeiviceClassfy, DeiviceName |

> **注意：** 1978–1984 和 2592 号策略在 `statisticalGraph.ts` 与 `production.ts` 中有**重复定义**，函数名略有不同（如 `yesterdayData` vs `Yesterdaysdata`），功能等价。

### 5.8 分类统计（bar.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 1942 | data | `getData()` | MineName |

### 5.9 产量监测（yieldMonitor.ts）

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 2249 | json | `getInstant(sdtime1, sdtime2)` | key, startTs, endTs, interval=2000, agg=avg |
| 2249 | json | `getInstantA(sdtime1, sdtime2)` | key, startTs, endTs, interval=480000, agg=avg |
| 2382 | data | `deiveceName()` | MineName |
| 2383 | data | `deiveceData()` | MineName |
| 4035 | json | `densityaData(sdtime1, sdtime2)` | key, startTs, endTs, interval=2000, agg=avg |
| 4035 | json | `densityaa2(sdtime1, sdtime2)` | key, startTs, endTs, interval=2000, agg=avg |
| 4035 | json | `getBushuiData(sdtime1, sdtime2)` | key, startTs, endTs, interval=2000, agg=avg |
| 4035 | json | `getBushuibData(sdtime1, sdtime2)` | key, startTs, endTs, interval=2000, agg=avg |
| 4035 | json | `getFenliuData(sdtime1, sdtime2)` | key, startTs, endTs, interval=2000, agg=avg |
| 4035 | json | `getFenliubData(sdtime1, sdtime2)` | key, startTs, endTs, interval=2000, agg=avg |

**产量监测设备 Key 映射：**

| Key | 含义 |
|---|---|
| `LTSXMC00300801112017375941` | 密度 + 瞬时流量 |
| `LTSXMC00300801081817135110` | 瞬时流量 |
| `LTSXMC00300801081816289424` | 补水（A 路） |
| `LTSXMC00300801081816289435` | 补水（B 路） |
| `LTSXMC00300801081816289457` | 分流（A 路） |
| `LTSXMC00300801081816289468` | 分流（B 路） |

### 5.10 人员定位（personnelLocation.ts）

人员定位模块是最大的 API 文件，使用动态策略 ID（通过函数参数传入）。

#### 固定策略 ID

| 策略 ID | 端点 | 函数 | 参数 |
|---|---|---|---|
| 5285 | data | `getPolicy5285(type)` | Type |
| 5400 | json | `getPolicy5400(AlarmType?)` | AlarmType |
| 6726 | json | `getPolicy6726(param)` | ShortDevLabel, Page, Row |
| 6748 | json | `getPolicy6748(param)` | DeviceId, Page, Row |

#### 动态策略 ID 函数

| 函数 | 端点 | 参数约定 |
|---|---|---|
| `getIndexData(id, type, str?)` | data | Type, Str |
| `getpolicy5281(id, param)` | json | Type, Str, Page, Row |
| `getDownHoleLineData(id, MineName, year)` | data | MineName, Year |
| `getDownHoleBarData(id, MineName, Year, Month)` | data | MineName, Year, Month |
| `getpersonalData(id, param)` | json | UserRealName, WorkNumber, SenderID, Department, Rank, WorkType, Page, Row |
| `getMonthCountData(id, param)` | data | 同上 + Year, Month |
| `getClassifyCountData(id, param)` | json | 同上 + Year, Month |
| `getDayCountData(id, param)` | json | 同上 + Day |
| `getSelectData(id, type?)` | json | Type |
| `getpolicy(id, params)` | data | WorkNumber, SenderID, Year, Month |
| `getpolicy5264(id, params)` | data | Month, Day, Type |
| `getpolicy5266(id, params)` | data | Month, Day, Type, Str |
| `getpolicy5339(id, SenderID)` | data | SenderID |
| `indexTablePopup(id)` | data | 无参数 |
| `getPolicy5401(id, param)` | json | type, AlarmType, StartTime, EndTime, Page, Row, WorkNumber, Number, Name, Remarks |
| `getpolicy5268(id, result)` | json | Senderid, STime, ETime, Page, Row |
| `getPolicy5280(id, param)` | json | UserRealName, WorkNumber, SenderID, Department, Rank, WorkType, Page, Row |
| `getPolicy5303(id, param)` | json | DeviceName, DeviceType, Area, Page, Row |
| `getPolicy2572(id, param)` | json | DeviceName, StartTime, EndTime, Page, Row |
| `GetStrategyJsonData(id, param)` | json | 自定义 StrategyParam[] |
| `GetStrategyData(id, param)` | data | 自定义 StrategyParam[] |
| `ExecPolicy(id, params)` | executeStrategy | 自定义 StrategyParam[] |

---

## 6. 通用参数

### getMineName()

所有请求几乎都包含矿井名称。通过 `getMineName()` 从 cookie（`MineName`）获取，页面生命周期内缓存：

```typescript
// src/api/system/helpers.ts
let _cachedMineName: string | null = null

export function getMineName(): string {
  if (_cachedMineName === null) {
    _cachedMineName = getCookieMineName() || ''
  }
  return _cachedMineName
}
```

### 分页参数命名差异

| 模块 | 参数名 | 示例 |
|---|---|---|
| 安全监测 / 实时报警 / 矿压 | `StartRow`、`PageRowNums` | StartRow=1, PageRowNums=10 |
| 人员定位 | `Page`、`Row` | Page=1, Row=20 |

### 参数拼写注意事项

后端 SQL 列名在前端作为参数名传递，存在以下拼写特殊约定，**不能修正**：

- `DeiviceClassfy` — 非标准拼写（正确应为 `DeviceClassify`）
- `DeiviceName` — 非标准拼写（正确应为 `DeviceName`）
- `SenderID` / `Senderid` — 大小写在不同函数中不统一
- `startTs` / `endTs` — 蛇形命名，仅产量监测使用

---

## 7. executeStrategy

`executeStrategy` 仅在人员定位模块中使用，用于执行策略命令（写操作），而非查询数据。

```typescript
// 唯一调用方式
export function ExecPolicy(id: number, params: StrategyParam[]) {
  return executeStrategy(id, params)
}
```

---

## 8. 非策略 API

### mine.ts — 矿井信息

```typescript
export function getCurrentMine() {
  return request({
    url: '/api/Mine/GetCurrentMine',
    method: 'get',
  })
}
```

这是唯一不走策略引擎的 API，直接使用 GET 请求。

### bwPublic — 规则引擎

```typescript
// personnelLocation.ts
export function bwPublicNodeRed(param: { api_id: string; data: any }) {
  return request.post('/bwPublic/SubmitAPI', {
    api_id: param.api_id,
    data: param.data,
  })
}
```

---

## 9. 使用示例

### 基本数据查询

```typescript
// 获取分类统计柱状图数据
import { getData } from '@/api/system/bar'

const res = await getData()
// res.code === 100, res.data.items = [...]
```

### 分页查询

```typescript
// 安全监测分页列表
import { listSafetyMonitoring } from '@/api/system/safetyMonitoring'

const res = await listSafetyMonitoring({
  pageNum: 1,
  pageSize: 10,
  theme: 'theme-dark',
  isCallThePolice: '0',
})
// res.code === 100, res.data = { total, items, pageIndex }
```

### 人员定位自定义查询

```typescript
// 通过动态策略 ID 查询
import { getPolicy5280 } from '@/api/system/personnelLocation'

const res = await getPolicy5280(5280, {
  UserRealName: '张三',
  WorkNumber: '',
  SenderID: '',
  Department: '',
  Rank: '',
  WorkType: '',
  Page: 1,
  Row: 20,
})
```

---

## 10. 策略 ID 快速索引

| ID 范围 | 模块 |
|---|---|
| 1920 | 移动端报警 |
| 1938–1965 | 安全监测 |
| 1942 | 分类统计柱状图 |
| 1978–1984 | 统计图表 / 生产监控（共享） |
| 1989–1992 | 矿压监测 |
| 2249 | 产量监测（瞬时） |
| 2382–2383 | 产量监测（设备） |
| 2591–2592 | 矿压汇总 / 日产量 |
| 2702–2704 | 统计汇总 |
| 3229–3231 | 统计 / 生产 |
| 3362–3365 | 新版安全监测 |
| 4035 | 产量监测（密度/补水/分流） |
| 5285–5401 | 人员定位（固定 ID） |
| 6726–6748 | 人员定位（设备） |
| 8453 | 安全监测 KPI |
