# 安全监测 API 文档

> 生成日期：2026-06-23 | 基于 `docs/策略API接口文档.md` + `datajson/` 实测数据

---

## 1. 端点与公共机制

所有策略 API 均为 **POST**，基础路径由 `VITE_APP_BASE_API` 指定（默认 `/net`）。

| 端点 | URL | 用途 |
|------|-----|------|
| `requestStrategyData(id, params, 'data')` | `/net/api/PoininfoSmartValid/GetStrategyData` | 通用查询 |
| `requestStrategyData(id, params, 'page')` | `/net/api/PoininfoSmartValid/GetPageStrategyData` | 分页查询 |
| `requestStrategyData(id, params, 'json')` | `/net/api/PoininfoSmartValid/GetStrategyJsonData` | JSON 查询 |

**公共请求体格式：**

```json
{
  "id": 1954,
  "parameter": [
    { "name": "MineName", "value": "山西保安煤业" }
  ]
}
```

**Axios 请求头自动附加：** `caller: WebMineManage`、`token`（从 `localStorage` 或 cookie `Access-Token` 获取）。

**响应码处理：**

| code | 含义 | 行为 |
|------|------|------|
| 100 | 成功 | 返回 `res.data` |
| 101 | 业务错误 | `ElMessage.error(msg)` 后 reject |
| 401 | Token 过期 | 弹窗确认后重定向 `/401` |
| 500 | 服务端错误 | `ElMessage.error(msg)` 后 reject |

---

## 2. 策略 1954 — 监测点分页列表 ⭐ 核心

**文件：** `src/api/system/safetyMonitoring.ts` → `listSafetyMonitoring(query)`

### 调用示例

```typescript
import { listSafetyMonitoring } from '@/api/system/safetyMonitoring'

const res = await listSafetyMonitoring({
  pageNum: 1,
  pageSize: 500,
  theme: 'theme-dark',
  isCallThePolice: '',    // ''=全部 '1'=报警 '0'=正常
  substation: '',          // 分站编号，空=全部
  type: '',                // devType，空=全部
  category: [],            // 类别数组，[]=全部
  area: '',                // 区域关键词
  site: '',                // 地点关键词
})
```

### 请求体

```json
{
  "id": 1954,
  "parameter": [
    { "name": "StartRow", "value": 1 },
    { "name": "PageRowNums", "value": 500 },
    { "name": "style", "value": "theme-dark" },
    { "name": "MineName", "value": "山西保安煤业" },
    { "name": "AlarmType", "value": 0 },
    { "name": "Station", "value": 0 },
    { "name": "DevType", "value": 0 },
    { "name": "CategoryName", "value": 0 },
    { "name": "Area", "value": "" },
    { "name": "Address", "value": "" }
  ]
}
```

### 响应示例

```json
{
  "code": 100,
  "data": {
    "total": 573,
    "items": [
      {
        "mineName": "山西保安煤业",
        "stationNo": 1,
        "devType": "模拟量",
        "categoryName": "瓦斯",
        "devArea": "地面洗选精煤仓5#煤仓上口甲烷",
        "devAddress": "地面洗选精煤仓5#煤仓上口甲烷_激光甲烷",
        "devLabel": "001A05",
        "detectionParam": "地面洗选精煤仓5#煤仓上口甲烷_激光甲烷",
        "alarmType": 0,
        "statusValue": 0,
        "statusTxt": "正常",
        "value": "0.00",
        "maxVal": 1.5,
        "detectionVal": "<div>...</div>",
        "detectionIcon": "<i class=\"iconfont\">...</i>",
        "valueUpdateDT": "2026-05-30 17:51:13.000",
        "name": "SXBAMY0030120001A05",
        "kepFullName": "AQ_WSJC_30.D.SXBAMY0030120001A05",
        "kepDes": "地面洗选精煤仓5#煤仓上口甲烷_激光甲烷传感器瓦斯793...",
        "voltage": null,
        "calibrationCycle": null,
        "calibrationDatetime": null,
        "state": "正常"
      }
    ]
  }
}
```

### 返回字段说明

| 字段 | 类型 | 说明 | 前端使用 |
|------|------|------|----------|
| `devLabel` | string | 设备编码（如 `001A05`） | 唯一标识、分站判断（含F=分站） |
| `devAddress` | string | 安装位置描述 | 卡片显示名 |
| `devType` | string | 类型（模拟量/开关量） | 筛选条件 |
| `categoryName` | string | 类别（瓦斯/CO/风速/温度/局扇...） | 分类统计、筛选 |
| `devArea` | string | 区域描述 | 矩阵区域分组 |
| `detectionParam` | string | 监测参数全称 | 矩阵叶子节点显示名 ★ |
| `stationNo` | number | 分站编号 | 分站归属 |
| `alarmType` | number/string | `0`=正常 `1`="1态报警" | 报警判定 |
| `statusTxt` | string | 状态文本（"正常"/"报警"/...） | 状态显示 |
| `value` | string | 当前值（字符串） | 需 parseFloat |
| `maxVal` | number | 量程上限 | 报警门限参考 |
| `detectionVal` | string | HTML 格式的检测值显示 | 忽略，用 value |
| `valueUpdateDT` | string | 值更新时间 | 最后更新 |
| `state` | string | 传感器状态标记 | 故障判断 |
| `voltage` | string\|null | 传感器电压 | 详情弹窗 |
| `calibrationDatetime` | string\|null | 最近标校时间 | 标校提醒（>15天） |
| `calibrationCycle` | string\|null | 标校周期 | 详情弹窗 |

**注意事项：**
- `detectionVal` 是 HTML 富文本（含进度条），**不要**直接渲染到模板，应用 `value` 替代
- `alarmType` 可能为数字 `0`/`1` 或字符串 `"0态报警"`/`"1态报警"`，需做兼容判断
- `devArea` 字段长度可能很长（如 `"地面洗选精煤仓5#煤仓上口甲烷"`），treemap 区域块名需截断

---

## 3. 策略 8453 — KPI 统计数据 ⭐ 核心

**文件：** `src/api/system/safetyMonitoring.ts` → `getKpiData()`

### 调用示例

```typescript
import { getKpiData } from '@/api/system/safetyMonitoring'

const res = await getKpiData()
// 返回数据无 items 包装，直接就是 data 对象
const kd = res.data  // { total: 535, analog: 313, switch: 222, ... }
```

### 请求体

```json
{
  "id": 8453,
  "parameter": [
    { "name": "MineName", "value": "山西保安煤业" }
  ]
}
```

### 响应示例（真实数据）

```json
{
  "code": 100,
  "data": {
    "total": 535,
    "analog": 313,
    "switch": 222,
    "substation": 38,
    "other": 0,
    "alarmPoint": 2,
    "devicesNeedCalibration": 0
  }
}
```

### 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `total` | number | 监测点总数 |
| `analog` | number | 模拟量传感器数量 |
| `switch` | number | 开关量传感器数量 |
| `substation` | number | 分站数量 |
| `alarmPoint` | number | 当前报警点数 |
| `devicesNeedCalibration` | number | 需要标校的设备数 |
| `other` | number | 其他类型（通常为0） |

---

## 4. 策略 1960 — 实时报警列表

**文件：** `src/api/system/ealTimeAlarm.ts` → `listEalTimeAlarm()`

### 调用示例

```typescript
import { listEalTimeAlarm } from '@/api/system/ealTimeAlarm'

// 获取最近 10 条实时报警（固定 pageSize=10）
const res = await listEalTimeAlarm()

// 分页获取更多
import { listMoreEalTimeAlarm } from '@/api/system/ealTimeAlarm'
const res2 = await listMoreEalTimeAlarm({ pageNum: 1, pageSize: 50 })
```

### 请求体

```json
{
  "id": 1960,
  "parameter": [
    { "name": "MineName", "value": "山西保安煤业" },
    { "name": "StartRow", "value": 1 },
    { "name": "PageRowNums", "value": 10 }
  ]
}
```

### 响应示例（真实数据）

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
  }
}
```

### 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `devLabel` | string | 设备编码 |
| `devAddress` | string | 安装位置描述 |
| `devType` | string | 类型（开关量/模拟量） |
| `categoryName` | string | 类别（局扇/瓦斯/...） |
| `alarmType` | string | 报警类型描述 |
| `categoryStateText` | string | 状态文本 |
| `alarmBeginDT` | string | 报警开始时间 |
| `valueUpdateDT` | string | 值更新时间 |
| `valueText` | string | 当前值文本描述（"开"/"停"等） |

---

## 5. 策略 1942 — 分类统计柱状图

**文件：** `src/api/system/bar.ts` → `getData()`

### 调用示例

```typescript
import { getData } from '@/api/system/bar'

const res = await getData()
// res.data 是数组，每项 { txt: '瓦斯', num: 128 }
```

### 请求体

```json
{
  "id": 1942,
  "parameter": [
    { "name": "MineName", "value": "山西保安煤业" }
  ]
}
```

### 响应示例

```json
{
  "code": 100,
  "data": [
    { "txt": "全部", "num": 573 },
    { "txt": "瓦斯", "num": 128 },
    { "txt": "一氧化碳", "num": 45 },
    { "txt": "风速", "num": 32 },
    { "txt": "温度", "num": 56 },
    { "txt": "局扇", "num": 28 },
    { "txt": "烟雾", "num": 12 },
    { "txt": "馈电", "num": 89 },
    { "txt": "风门", "num": 34 },
    { "txt": "风筒", "num": 18 }
  ]
}
```

### 前端处理

```typescript
// 过滤掉"全部"
const catData = (res.data || []).filter((d: any) => d.txt !== '全部')
catCategories.value = catData.map((d: any) => d.txt)    // ['瓦斯','一氧化碳',...]
catValues.value = catData.map((d: any) => d.num)        // [128, 45, ...]
```

---

## 6. 下拉框数据（筛选条件）

### 6.1 策略 1938 — 分站下拉

```typescript
import { substationSelect } from '@/api/system/safetyMonitoring'
const res = await substationSelect()
// res.data: [{ txt: '1#分站', val: '1' }, { txt: '2#分站', val: '2' }, ...]
```

### 6.2 策略 1940 — 类型下拉

```typescript
import { typeSelect } from '@/api/system/safetyMonitoring'
const res = await typeSelect()
// res.data: [{ txt: '模拟量', val: '模拟量' }, { txt: '开关量', val: '开关量' }]
```

### 6.3 策略 1947 — 类别下拉（支持筛选联动）

```typescript
import { categorySelect } from '@/api/system/safetyMonitoring'
const res = await categorySelect('模拟量')  // 传空=全部类型
// res.data: [{ txt: '瓦斯', val: '瓦斯' }, { txt: '一氧化碳', val: '一氧化碳' }, ...]
```

### 6.4 策略 1961 — 区域下拉

```typescript
import { areaSelect } from '@/api/system/safetyMonitoring'
const res = await areaSelect()
```

### 6.5 策略 1964 — 地点下拉

```typescript
import { siteSelect } from '@/api/system/safetyMonitoring'
const res = await siteSelect()
```

---

## 7. 详情查询

### 7.1 策略 1964 — 分站详情

```typescript
import { substationInfo } from '@/api/system/safetyMonitoring'
// devLabel 含 'F' 时调用（如 '001F01'）
const res = await substationInfo('001F01')
// res.data[0]: { devLabel, stationNo, stationArea, stationAddress, curState, state1~4, stationModel, ... }
```

### 7.2 策略 1965 — 监测点详情

```typescript
import { monitoringPointInfo } from '@/api/system/safetyMonitoring'
// devLabel 不含 'F' 时调用（如 '001A05'）
const res = await monitoringPointInfo('001A05')
// res.data[0]: { devLabel, devType, categoryName, detectionParam, range, unit, highAlarm, LowAlarm, highAlarmRestore, LowAlarmRestore, state1~7, calibrationDatetime, calibrationCycle, voltage, ... }
```

---

## 8. 数据加载时序

安全监测仪表盘 (`/index.cpt`) 挂载时并发发起 3 个请求：

```typescript
const [monitorRes, kpiRes, catRes] = await Promise.all([
  listSafetyMonitoring({ pageNum: 1, pageSize: 500, ... }),  // 策略 1954
  getKpiData(),                                                // 策略 8453
  getData(),                                                   // 策略 1942
])

// 同时异步加载实时告警
fetchAlarms()  // 策略 1960
```

每 **10 秒** 自动刷新全部数据。

---

## 9. 策略 ID 速查

| 策略 ID | 端点 | 函数 | 用途 |
|---------|------|------|------|
| 1938 | data | `substationSelect()` | 分站下拉 |
| 1940 | data | `typeSelect()` | 类型下拉 |
| 1942 | data | `getData()` | 分类统计柱状图 |
| 1947 | data | `categorySelect(typeName?)` | 类别下拉 |
| 1954 | page | `listSafetyMonitoring(query)` | 监测点分页列表 ⭐ |
| 1960 | page | `listEalTimeAlarm()` | 实时报警列表 |
| 1961 | data | `areaSelect()` | 区域下拉 |
| 1964 | data | `siteSelect()` / `substationInfo(label)` | 地点下拉 / 分站详情 |
| 1965 | data | `getSafetyMonitoringTotal()` / `monitoringPointInfo(label)` | 总数 / 监测点详情 |
| 8453 | data | `getKpiData()` | KPI 统计数据 ⭐ |
