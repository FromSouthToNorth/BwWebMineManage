# 安全监测策略 API 速查

> `src/api/system/safetyMonitoring.ts` | 端点：`POST /net/api/PoininfoSmartValid/GetStrategy{Data|PageData}`

## 公共参数

所有请求必带 `{ name: "MineName", value: getMineName() }` — 从 cookie `MineName` 自动获取。

| 名称 | 值 | 说明 |
|------|-----|------|
| `MineName` | `"山西保安煤业"` | 矿井名称，由 cookie 注入 |
| `StartRow` | `1` | 起始行号 |
| `PageRowNums` | `10` | 每页行数 |

---

## 1. listSafetyMonitoring — 监测点分页列表

```
策略 1954  端点 page
```

```typescript
listSafetyMonitoring({
  pageNum: 1,              // StartRow，默认 1
  pageSize: 500,           // PageRowNums，默认 500
  theme: 'theme-dark',     // style，默认 'theme-dark'
  isCallThePolice: '',     // AlarmType：''=全部 '1'=报警 '0'=正常  → 默认 ''
  substation: '',          // Station：分站编号，''=全部           → 默认 ''
  type: '',                // DevType：类型，''=全部               → 默认 ''
  category: [],            // CategoryName：类别数组，[]=全部      → 默认 []
  area: '',                // Area：区域关键词，''=全部            → 默认 ''
  site: '',                // Address：地点关键词，''=全部         → 默认 ''
})
```

**下发请求体：**

```json
{
  "id": 1954,
  "parameter": [
    { "name": "StartRow", "value": 1 },
    { "name": "PageRowNums", "value": 500 },
    { "name": "style", "value": "theme-dark" },
    { "name": "MineName", "value": "山西保安煤业" },
    { "name": "AlarmType", "value": "" },
    { "name": "Station", "value": "" },
    { "name": "DevType", "value": "" },
    { "name": "CategoryName", "value": "" },
    { "name": "Area", "value": "" },
    { "name": "Address", "value": "" }
  ]
}
```

**返回示例：**

```json
{
  "code": 100,
  "data": {
    "total": 573,
    "items": [
      {
        "devLabel": "001A05",
        "devType": "模拟量",
        "categoryName": "瓦斯",
        "stationNo": 1,
        "devArea": "地面洗选精煤仓5#煤仓上口甲烷",
        "devAddress": "地面洗选精煤仓5#煤仓上口甲烷_激光甲烷",
        "detectionParam": "地面洗选精煤仓5#煤仓上口甲烷_激光甲烷",
        "alarmType": 0,
        "statusTxt": "正常",
        "value": "0.00",
        "maxVal": 1.5,
        "valueUpdateDT": "2026-05-30 17:51:13.000",
        "name": "SXBAMY0030120001A05",
        "kepFullName": "AQ_WSJC_30.D.SXBAMY0030120001A05",
        "state": "正常",
        "voltage": null,
        "calibrationCycle": null,
        "calibrationDatetime": null
      }
    ]
  }
}
```

**关键字段映射：**

| 字段 | 前端用法 |
|------|---------|
| `devLabel` | 唯一 ID；含 `F` → 分站，否则 → 监测点 |
| `detectionParam` | treemap 叶子节点显示名 ★ |
| `devAddress` | 卡片标题 |
| `alarmType` | `0`=正常 `1`=报警 |
| `value` | 当前值（parseFloat） |
| `maxVal` | 报警门限参考 |
| `calibrationDatetime` | 标校时间，＞15天未更新则「需标校」 |

---

## 2. getKpiData — KPI 统计

```
策略 8453  端点 data
```

```typescript
getKpiData()
// 无参数（仅 MineName）
```

**返回示例：**

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

> **注意：** `res.data` 直接就是统计对象，**无** `items` 包装。

---

## 3. getData — 分类统计

```
策略 1942  端点 data  (src/api/system/bar.ts)
```

```typescript
getData()
// 无参数（仅 MineName）
```

**返回示例：**

```json
{
  "code": 100,
  "data": [
    { "txt": "全部", "num": 573 },
    { "txt": "瓦斯",   "num": 128 },
    { "txt": "一氧化碳", "num": 45 },
    { "txt": "风速",   "num": 32 }
  ]
}
```

> 前端需 `filter(d => d.txt !== '全部')` 过滤掉汇总行。

---

## 4. listEalTimeAlarm — 实时报警

```
策略 1960  端点 page  (src/api/system/ealTimeAlarm.ts)
```

```typescript
listEalTimeAlarm()
// 固定取最近 10 条，无额外参数
```

**返回示例：**

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
        "alarmType": "0态报警",
        "alarmBeginDT": "2026-05-30 17:51:13.000",
        "valueText": "停"
      }
    ]
  }
}
```

---

## 5. 下拉框接口

| 函数 | 策略 | 说明 | 参数 |
|------|------|------|------|
| `substationSelect()` | 1938 | 分站下拉 | — |
| `typeSelect()` | 1940 | 类型下拉 | — |
| `categorySelect(type?)` | 1947 | 类别下拉 | `type`=''=全部 或 '模拟量'/'开关量' |
| `areaSelect()` | 1961 | 区域下拉 | — |
| `siteSelect()` | 1964 | 地点下拉 | — |

> 返回格式统一：`{ code: 100, data: [{ txt: "显示名", val: "值" }] }`

---

## 6. 详情接口

| 函数 | 策略 | 调用条件 |
|------|------|---------|
| `substationInfo(devLabel)` | 1964 | `devLabel` 含 `F`（分站） |
| `monitoringPointInfo(devLabel)` | 1965 | `devLabel` 不含 `F`（监测点） |

> 返回：`res.data[0] = { devLabel, stationNo, stationArea, curState, state1~7, voltage, calibrationDatetime, range, unit, highAlarm, LowAlarm, highAlarmRestore, LowAlarmRestore, ... }`

---

## 策略 ID 总览

| ID | 端点 | 函数 | 备注 |
|----|------|------|------|
| **1954** | page | `listSafetyMonitoring()` | ⭐ 监测点分页列表 |
| **8453** | data | `getKpiData()` | ⭐ KPI 统计 |
| **1942** | data | `getData()` | ⭐ 分类柱状图 |
| **1960** | page | `listEalTimeAlarm()` | ⭐ 实时告警 |
| 1938 | data | `substationSelect()` | 分站下拉 |
| 1940 | data | `typeSelect()` | 类型下拉 |
| 1947 | data | `categorySelect(type?)` | 类别下拉 |
| 1961 | data | `areaSelect()` | 区域下拉 |
| 1964 | data | `siteSelect()` / `substationInfo()` | 地点下拉 / 分站详情 |
| 1965 | data | `getSafetyMonitoringTotal()` / `monitoringPointInfo()` | 总数 / 监测点详情 |

## 页面加载并发时序

```
onMounted
└─ Promise.all([
     listSafetyMonitoring({ pageNum:1, pageSize:500, ... }),    // 1954
     getKpiData(),                                              // 8453
     getData(),                                                 // 1942
   ])
└─ listEalTimeAlarm()                                           // 1960
└─ setInterval(10s) → 重复以上全部
```
