# 安全监测界面设计及策略 API 文档

> 生成日期：2026-06-24 | 涵盖 `views/system/safetyMonitoring/` 全部页面及关联 API
> 技术栈：HTML5 + CSS3 + 原生 JavaScript（ES6 模块），无构建工具，无包管理器

---

## 一、界面总览

```
┌─────────────────────────────────────────────────────────────────────┐
│  HERO ROW: 监测总数 │ 报警点数 │ 正常运行 │ 安全率 │ 故障设备 │ 需标校   │
│                     L1 L2 L3 L4                                    │
├─────────────────────────────────────────────────────────────────────┤
│  突出预警条（煤与瓦斯突出风险时显示，红色闪烁）                          │
├──────────────────────────────────┬──────────────────────────────────┤
│  监测点列表                       │  实时告警 AlarmTimeline           │
│  MonitoringPointList             │  L3/L4 计数徽章 + LIVE 脉冲指示器  │
│  ── 左侧 70% ──                  │  分级色标 L1(黄)/L2(红)/L3(橙)/    │
│  SVG 图标 + "监测点列表" + 共 N 条  │  L4(紫)                          │
│  + 过滤标签（类别/区域）[×清除]     │  内置 [历史→] 按钮 → 历史报警弹窗  │
│  列: 点号 | 名称 | 状态值(含单位)    │ ──────────────────────────────── │
│      | 时间 | 状态               │  安全状态分布 StatusRing          │
│  无区域列（仅用于排序/分组）        │  环形图 + 中心安全率               │
│  行左侧发光条 — 分级着色            │ ──────────────────────────────── │
│  (CSS 自定义属性 --mpl-glow)     │  分类统计 CategoryBar             │
│  正常绿/预警黄/报警红/紧急橙(脉冲)/ │  水平柱状图 + 点击筛选             │
│  突出紫(快脉冲)/故障琥珀/离线灰     │ ──────────────────────────────── │
│  客户端过滤+排序+分页              │  快捷操作: [日报表]               │
│  [更多>] → /safetyMonitoringMore  │                                  │
├──────────────────────────────────┴──────────────────────────────────┤
│  馈电状态面板 FeedStatusPanel（底部可展开/折叠）                      │
├─────────────────────────────────────────────────────────────────────┤
│  弹窗: SafetyMonitoringDetail │ ReportPanel                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、设计对标标准

本界面设计依据以下国家安全生产行业标准：

| 标准号 | 名称 | 年份 | 角色 |
|--------|------|------|------|
| **AQ 6201** | 煤矿安全监控系统通用技术要求 | 2019（替代 2006） | 功能需求来源 |
| **AQ 1029** | 煤矿安全监控系统及检测仪器使用管理规范 | 2019（替代 2007） | 传感器设置 + 运维规范 |

### AQ6201-2006 → AQ6201-2019 关键变化

| 指标 | 2006 版 | 2019 版 | 提升 |
|------|---------|---------|------|
| 最大巡检周期 | ≤30s | ≤20s | ↑33% |
| 双机切换时间 | ≤5min | ≤60s | ↑80% |
| 备用电源 | ≥2h | ≥4h | ↑100% |
| 传输处理误差 | ≤1.0% | ≤0.5% | ↑50% |
| 误码率 | ≤10⁻⁸ | ≤10⁻⁹ | ↑90% |
| 实时数据存储 | ≥7d | ≥3 个月 | ↑13× |
| 历史记录存储 | ≥1 年 | ≥2 年 | ↑100% |
| 故障数据丢失 | ≤5min | ≤60s | ↑80% |
| 主机切换 | 手动/自动 | **双机热备自动** | 架构升级 |
| 加密存储 | 无 | **RSA 加密** | 新增 |
| 分站容量 | 8/16/32/64/128 | +**256** | 扩展 |
| 无线传感器 | 无 | ≥100m 距离, ≥24h 电池 | 新增 |
| 煤与瓦斯突出 | 无 | §§5.5.2.3/2.4 | 新增 |
| 分级/逻辑报警 | 无 | §§5.6.12.3/12.4 | 新增 |
| 应急联动 | 无 | §5.5.2.7 | 新增 |
| 数据应用分析 | 无 | §5.5.17 | 新增 |

### AQ1029-2007 → AQ1029-2019 关键变化

| 变化项 | 2007 版 | 2019 版 |
|--------|---------|---------|
| 传感器防护等级 | 无要求 | 气体类 ≥IP65，其余 ≥IP54 |
| 突出矿井甲烷传感器 | 无特殊要求 | 必须全量程/高低浓度，宜激光原理 |
| 主干线缆 | 无要求 | 必须分设两条，不同井筒入井 |
| 甲烷传感器调校周期 | 每 10d | 每 **15d**（催化原理）/ 每 **6 个月**（激光原理） |
| 甲烷电闭锁测试周期 | 每 10d | 每 **15d**，可能停电的每 **半年** |
| 双机备份 | 双机或多机 | **双机热备**，60s 切换，不得用虚拟机 |
| UPS 时长 | 2h | **4h** |
| 光纤共用 | 无要求 | 不得与图像监视共用同一芯光纤 |
| 伪数据标注/大数据分析 | 无 | 必须支持 |
| 应急联动 | 无 | 超限断电时自动联动广播/通信/定位 |
| 中心站显示终端 | 调度室 | 调度室（强调） |
| 风速传感器 | 回风巷测风站 | +突出煤层采煤工作面回风巷和掘进巷道回风流 |
| 风向传感器 | 无 | 新增（突出煤层进风巷/分风口），逆转时声光报警 |
| 粉尘传感器 | 无 | 新增（采煤机/掘进机/转载点等） |
| 压风机温度传感器 | 无 | 新增（温度超限声光报警+断电） |

---

## 三、AQ6201-2019 §5.5 功能需求覆盖矩阵

### §5.5.1 数据采集

| 需求 | 实现状态 | 说明 |
|------|---------|------|
| 甲烷/风速/风压/CO/温度/粉尘模拟量采集 | ✅ 已覆盖 | 策略 1954 返回全部类型，监测点列表展示 |
| 馈电/风机/风筒/风门/风向/烟雾开关量采集 | ✅ 已覆盖 | alarmType/statusTxt 字段判定 |
| 瓦斯抽采量监测显示 | ⚠️ 依赖后端 | 前端预留，后端数据未返回 |

### §5.5.2 控制（核心功能）

| 需求 | 实现状态 | 说明 |
|------|---------|------|
| 甲烷超限声光报警 + 断电/复电 (§5.5.2.1) | ✅ 前端判定 | Lv2→报警，OutburstWarning 闪烁，断电命令由后端执行 |
| 甲烷风电闭锁 (§5.5.2.2) a-f 6条 | ⚠️ 后端控制 | 前端展示闭锁状态，实际断电由分站+断电控制器完成 |
| 掘进面突出报警断电 (§5.5.2.3) | ✅ 前端展示 | OutburstWarning + Lv4 逻辑检测 |
| 采煤面突出报警断电 (§5.5.2.4) | ✅ 前端展示 | 同上，进回风巷+风速+风向联合判断 |
| 地面中心站手动遥控断电/复电 (§5.5.2.5) | ❌ 未实现 | 需新增遥控操作界面（权限管理+操作记录） |
| 异地断电/复电 (§5.5.2.6) | ❌ 未实现 | 需后端策略支持 |
| 应急联动 (§5.5.2.7) | ❌ 未实现 | 需后端与广播/通信/定位系统对接 |

### §5.5.4 存储和查询

| 需求 | 实现状态 |
|------|---------|
| 实时监测值查询（地点+名称索引） | ✅ 策略 1954 |
| 统计值（最大/平均/最小） | ⚠️ 前端新增字段已预留，依赖后端返回 |
| 报警/断电/复电时刻及状态 | ✅ 策略 1960 + detail 弹窗 |
| 馈电异常时刻及状态 | ✅ FeedStatusPanel |
| 局扇/风筒/主扇/风门/风向状态及变化 | ⚠️ 部分覆盖，风向传感器数据缺失 |
| 瓦斯抽采量累计量 | ⚠️ 依赖后端 |
| 设备故障/恢复时刻及状态 | ✅ FaultState 判定 + GradeAlarmPanel |
| RSA 加密存储 (§5.5.4.2) | ❌ 前端不涉及 |

### §5.5.5 显示

| 需求 | 实现状态 | 组件 |
|------|---------|------|
| 列表显示（模拟量 15 字段）(§5.5.5.1a) | ✅ | SafetyMonitoringDetail 弹窗 + MonitoringPointList |
| 列表显示（开关量 8 字段）(§5.5.5.1b) | ✅ | SwitchStateChart + tooltip |
| 列表显示（累计量）(§5.5.5.1c) | ⚠️ | 预留未实现 |
| 同坐标模拟量曲线+开关状态图 (§5.5.5.2) | ⚠️ | 分开展示，未合并在同一坐标 |
| 实时/历史曲线（多色最大值/平均值/最小值）(§5.5.5.3) | ✅ | TrendChart（实时累积），历史需后端 |
| 开关量状态图及柱状图 (§5.5.5.4) | ✅ | SwitchStateChart |
| 模拟动画显示（通风系统图+设备开停+数值）(§5.5.5.5) | ❌ 未实现 | 需 GIS/SVG 底图 + 数据叠加 |
| 设备布置图（传感器/分站/电源/断电控制器位置）(§5.5.5.6) | ⚠️ | 监测点列表按区域分组展示，非地理布置图 |

### §5.5.6 打印 — §5.5.17 数据应用分析

| 需求 | 实现状态 |
|------|---------|
| 9 类报表打印 (§5.5.6) | ⚠️ ReportPanel 仅实现日(班)报表 |
| 人机对话 (§5.5.7) | ❌ |
| 自诊断（4 类）(§5.5.8) | ⚠️ 故障设备列表/标校提醒已实现，传感器定义/通信状态未实现 |
| 双机热备切换 (§5.5.9) | ❌ 后端功能 |
| 备用电源 (§5.5.10) | ❌ 后端功能 |
| 数据备份 (§5.5.11) | ❌ 后端功能 |
| 模拟报警和断电 (§5.5.12) | ❌ |
| 防雷 (§5.5.13) | ❌ 硬件设计 |
| 联网 (§5.5.14) | ✅ |
| 软件自监视和容错 (§5.5.15) | ❌ |
| 实时多任务 (§5.5.16) | ✅ 10s 轮询 |
| 数据应用分析（伪数据标注/异常分析/预测预警）(§5.5.17) | ⚠️ 逻辑报警已实现，伪数据标注未实现 |

---

## 四、AQ6201-2019 §5.6.9 曲线颜色规范

标准规定曲线显示必须使用特定颜色标注阈值线：

| 阈值 | 线型 | 颜色 | 标准原文 |
|------|------|------|----------|
| 报警浓度 | 黄色虚线 | `#eab308` | "用平行于横轴的**黄色虚线**给出报警浓度" |
| 断电浓度 | 红色虚线 | `#ef4444` | "用平行于横轴的**红色虚线**给出断电浓度" |
| 复电浓度 | 蓝色虚线 | `#3b82f6` | "用平行于横轴的**蓝色虚线**给出复电浓度" |
| 实时监测值 | 实线 | 主题色 | "实时监测值、最大值、平均值、最小值等用不同颜色表示" |

> TrendChart 组件已实现三色阈值虚线 + markLine 标注。

---

## 五、AQ6201-2019 §5.6.12 报警规范

| 需求 | 实现 |
|------|------|
| 声音报警 (§5.6.12.1) | ❌ 前端可加 Audio API，当前未实现 |
| 光报警 (§5.6.12.2) | ✅ 红色文字/图符/闪烁（表格+曲线+列表模式均覆盖） |
| **分级报警** (§5.6.12.3) | ✅ Lv0-Lv4 五级，L3快速脉冲，L4闪烁 |
| **逻辑报警** (§5.6.12.4) | ✅ 甲烷+风速关联/多传感器级联/进回风巷联合 |

---

## 六、AQ1029-2019 甲烷传感器报警/断电/复电浓度表

规范表1 规定了各位置甲烷传感器的阈值（%CH₄）。前端展示需确保卡片和详情弹窗能显示这三项阈值：

| 位置 | 报警浓度 | 断电浓度 | 复电浓度 | 断电范围 |
|------|---------|---------|---------|---------|
| 采煤工作面回风隅角 T₀ | ≥1.0 | ≥1.5 | <1.0 | 工作面及回风巷全部非本安 |
| 低/高瓦斯矿井采煤工作面 T₁ | ≥1.0 | ≥1.5 | <1.0 | 工作面及回风巷全部非本安 |
| 突出矿井采煤工作面 T₁ | ≥1.0 | ≥1.5 | <1.0 | 工作面及进回风巷全部非本安 |
| 采煤工作面回风巷 T₂ | ≥1.0 | ≥1.0 | <1.0 | 工作面及回风巷全部非本安 |
| 突出矿井进风巷 T₃ | ≥0.5 | ≥0.5 | <0.5 | 进风巷全部非本安 |
| 串联通风被串面进风巷 T₄ | ≥0.5 | ≥0.5 | <0.5 | 被串面及进回风巷全部非本安 |
| 高瓦斯/突出回风巷中部 | ≥1.0 | ≥1.0 | <1.0 | 工作面及回风巷全部非本安 |
| 采煤机/掘进机 | ≥1.0 | ≥1.5 | <1.0 | 设备电源 |
| 掘进工作面 T₁ | ≥1.0 | ≥1.5 | <1.0 | 掘进巷道全部非本安 |
| 掘进工作面回风流 T₂ | ≥1.0 | ≥1.0 | <1.0 | 掘进巷道全部非本安 |
| 突出矿井掘进进风分风口 T₄ | ≥0.5 | ≥0.5 | <0.5 | 掘进巷道全部非本安 |
| 串联通风被串局扇前 T₃ | ≥0.5 | ≥1.5 | <0.5 | 含局扇的被串巷道全部非本安 |
| 采区回风巷 | ≥1.0 | ≥1.0 | <1.0 | 采区回风巷全部非本安 |
| 一翼/总回风巷 | ≥0.75 | — | — | — |
| 回风流机电硐室 | — | — | — | 2019 版已删除 |
| 装煤点 | ≥0.5 | ≥0.5 | <0.5 | 上风流100m+下风流架空线 |
| 瓦斯涌出巷道下风流 | ≥0.5 | ≥0.5 | <0.5 | 上风流100m+下风流架空线 |
| 回风井筒带式输送机 | ≥0.5 | ≥0.7 | <0.7 | 井筒全部非本安 |
| 临时施工电气上风侧 | ≥1.0 | ≥1.0 | <1.0 | 对应回风巷全部非本安 |
| 井下煤仓/选煤厂煤仓上方 | ≥1.5 | ≥1.5 | <1.5 | 运煤设备及其他非本安 |
| 地面瓦斯抽采泵房 | ≥0.5 | — | — | — |
| 井下临时抽采泵站栅栏外 | ≥0.5 | ≥1.0 | <0.5 | 抽采泵站电源 |
| 抽采泵输入管路 | ≤25% CH₄ | — | — | — |
| 利用瓦斯输出管路 | ≤30% CH₄ | — | — | — |
| 不利用瓦斯输出管路 | ≤25% CH₄ | — | — | — |

> 前端卡片和详情弹窗已预留 `alarmThreshold` / `cutoffThreshold` / `reconnectThreshold` 字段，数据需从后端策略查询（当前后端可能已返回在 `highAlarm` / `highAlarmRestore` / `LowAlarmRestore` 等字段中）。

---

## 七、AQ1029-2019 维护管理关键参数

### 调校周期（§8.3）

| 设备类型 | 周期 | 说明 |
|---------|------|------|
| 载体催化式甲烷传感器 | **每 15d 至少 1 次** | 2019 版从 10d 改为 15d |
| 激光原理甲烷传感器 | **每 6 个月至少 1 次** | 新增 |
| 便携式甲烷检测报警仪 | **每 15d 至少 1 次** | 同上 |
| 甲烷电闭锁和风电闭锁测试 | **每 15d 至少 1 次** | 可能造成局扇停电的每半年 1 次 |
| 其他气体监控设备 | 按说明书 | — |
| 风速传感器 | 用标定风速计调校 | — |
| 温度传感器 | 用标定温度计调校 | — |

> **前端实现：** `calibCount` KPI 卡片统计 `calibrationDatetime` >15d 未更新的设备数，KPI HeroCard「需标校」展示。

### 地面中心站装备（§9.1）

| 要求 | 2007版 | 2019版 |
|------|--------|--------|
| 双机热备 | 双机或多机，5min 切换 | 双机热备，**60s** 切换 |
| 不间断电源 | 双回路 + ≥2h UPS | 双回路 + ≥**4h** UPS |
| 主机类型 | 工控机/PC | 工控机/服务器，**不得用虚拟机** |
| 显示终端 | 矿调度室 | 矿调度室 |
| 网络安全 | 防火墙 | 网络安全设备 |
| 录音电话 | 必须 | 必须 |

### 备份要求（§10.1.4-10.1.5）

- 数据备份：每 **3 个月**备份一次，介质保存 ≥**2 年**
- 图纸、技术资料：保存时间 ≥**2 年**

---

## 八、页面模块清单

采用原生 HTML + CSS + JS 模块化组织，每个功能模块为一个独立文件夹，包含 `.html`（结构）、`.css`（样式）、`.js`（逻辑）三个文件。

| 模块 | 文件 | 对标标准 | 说明 |
|------|------|----------|------|
| **主仪表盘** | `safetyMonitoring/index.html` + `index.css` + `index.js` | — | 主仪表盘页面，6 KPI + 70/30 左右分栏 + 突出预警 + 馈电 + 弹窗。`index.js` 在 `DOMContentLoaded` 时初始化，使用 `setInterval` 10s 轮询 |
| **HeroCard** | `components/HeroCard.html` + `HeroCard.css` + `HeroCard.js` | — | KPI 卡片函数，通过 `HeroCard.create(container, config)` 创建，支持 icon/footer 设置，4 色变体，毛玻璃 + glow orb；报警点数卡片含 L1-L4 子徽章 |
| **MonitoringPointList** | `components/MonitoringPointList.html` + `MonitoringPointList.css` + `MonitoringPointList.js` | §5.5.5.1 列表显示 | 监测点客户端分页列表，列: 点号/名称/状态值(含单位)/时间/状态（无区域列），行左侧 CSS 自定义属性发光条分级着色，客户端过滤+排序+分页，单击行筛选，双击行或详情按钮打开详情弹窗，[更多>] 跳转 /safetyMonitoringMore |
| **StatusRing** | `components/StatusRing.html` + `StatusRing.css` + `StatusRing.js` | §5.5.5.4 状态图 | 环形图，正常/L1/L2/L3/L4/故障 多切片 + 中心安全率（基于 Canvas 或 ECharts CDN） |
| **CategoryBar** | `components/CategoryBar.html` + `CategoryBar.css` + `CategoryBar.js` | §5.5.5.4 柱状图 | 按类别（瓦斯/CO/风速…）水平柱状图，点击柱筛选，数据来自策略 1942 |
| **AlarmTimeline** | `components/AlarmTimeline.html` + `AlarmTimeline.css` + `AlarmTimeline.js` | §5.6.7.2 实时显示 | 告警时间线（支持垂直/水平双布局），L3/L4 计数徽章 + LIVE 脉冲指示器 + NEW 标记 + 分级色标；内置 [历史→] 按钮打开历史报警查询弹窗（策略 1963），弹窗内支持地点/类型/时间范围筛选 + 分页 |
| **OutburstWarning** | `components/OutburstWarning.html` + `OutburstWarning.css` + `OutburstWarning.js` | §5.5.2.3/2.4 突出 | 煤与瓦斯突出预警条，多条件联合判断（多传感器级联+风速+风向），Lv4 紫色闪烁 |
| **FeedStatusPanel** | `components/FeedStatusPanel.html` + `FeedStatusPanel.css` + `FeedStatusPanel.js` | §9.2.2 馈电异常 | 底部可展开/折叠面板，馈电正常/异常/断电/离线状态列表 |
| **ReportPanel** | `components/ReportPanel.html` + `ReportPanel.css` + `ReportPanel.js` | §5.6.14 报表打印 | 模拟量日报表预览 + 浏览器打印，快捷操作入口 |
| **SafetyMonitoringDetail** | `components/SafetyMonitoringDetail/index.html` + `index.css` + `index.js` | §5.5.5.1 列表显示 | 详情弹窗（公共组件），增强型 Hero 区（大字数值+单位+报警等级徽章），区分为分站详情/监测点详情路径，含阈值状态/测点信息/标校维护/设备状态/开关量属性/模拟量属性/时间属性等分区，可跳转历史曲线（iframe） |

---

## 九、数据流

```
DOMContentLoaded
│
├─ fetchAll()   ← 并行拉取三路数据
│   ├─ listSafetyMonitoring(1954, pageNum=1, pageSize=500) → 首次拉取
│   │   └─ 循环 p=2..totalPages 拉取剩余页 → 全量 monitorItems
│   ├─ getKpiData(8453, data)            → kpi 统计
│   └─ getData(1942, data)               → 分类统计 (catCategories, catValues)
│
├─ fetchAlarms() ← 独立拉取报警
│   └─ listEalTimeAlarm(1960, page)       → alarmFeed (AlarmItem[])
│
│  前端处理 (每次 fetchAll 后):
│   ├─ buildStateText(item, unit, dv)    → categoryStateText (展示文本)
│   │    回退链: categoryStateText → stateText → valueText
│   │          → "dv.toFixed(2) + unit" → statusTxt/state → ''
│   ├─ parseNumeric(detectionVal)        → dv (NaN 守卫 → 0)
│   ├─ getAlarmLevel(item, rawAlarmType) → _alarmLevel (0-4)
│   │    综合判定: alarmType == 1 || statusTxt === '报警'
│   │           || state === '报警' → determineAlarmLevel()
│   ├─ checkOutburstConditions(items)    → outburstConditions
│   │    区域分组 + Lv≥3 多传感器级联 + 风速/风向/风机
│   └─ buildFeedStatusData(items)        → feedItems
│        matchTask() 匹配馈电传感器 → 正常/异常/断电/离线
│        后备: 从报警传感器推导馈电状态
│
└─ setInterval(10s) → 重复 fetchAll + fetchAlarms
```

`fetchAll()` 和 `fetchAlarms()` 都在 `DOMContentLoaded` 中首次调用，之后通过 `setInterval` 每 10 秒轮询。每次数据到达后，调用各模块的 `render()` 函数更新 DOM。

### 数据拉取代码模式

```javascript
// api/safetyMonitoring.js — 策略 API 辅助函数
/**
 * @param {number} strategyId - 策略 ID
 * @param {Array<{name: string, value: string|number}>} params - 参数数组
 * @param {'data'|'page'|'json'} endpoint - 端点类型
 * @returns {Promise<any>}
 */
export async function requestStrategyData(strategyId, params, endpoint = 'data') {
  const basePath = '/WebMineManage';
  const urlMap = {
    data: `${basePath}/api/PoininfoSmartValid/GetStrategyData`,
    page: `${basePath}/api/PoininfoSmartValid/GetPageStrategyData`,
    json: `${basePath}/api/PoininfoSmartValid/GetStrategyJsonData`
  };
  const res = await fetch(urlMap[endpoint], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'caller': 'WebMineManage',
      'token': getToken()
    },
    body: JSON.stringify({ id: strategyId, parameter: params })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code === 100 || json.code === 200) return json.data;
  if (json.code === 101) throw new Error(json.mesg || '业务错误');
  throw new Error(json.mesg || '请求失败');
}

/**
 * 从 cookie + localStorage 获取矿井名称
 * @returns {string}
 */
export function getMineName() {
  // 优先 cookie（document.cookie 解析），回退 localStorage
  const match = document.cookie.match(/(?:^|;\s*)MineName=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);
  return localStorage.getItem('pro__MineName') || '';
}
```

---

## 十、分级报警体系

| 级别 | 标签 | 颜色 | 动画 | 触发条件 |
|------|------|------|------|---------|
| Lv0 | 正常 | 绿 `#22c55e` | 无 | 未达报警门限 |
| Lv1 | 预警 | 黄 `#eab308` | 慢脉冲 | ≥报警门限 且 <断电门限 |
| Lv2 | 报警 | 红 `#ef4444` | 脉冲 | ≥断电门限 |
| Lv3 | 紧急 | 橙 `#f97316` | 快脉冲 | 超限且变化率 >10% |
| Lv4 | 突出 | 紫 `#a855f7` | 闪烁 | 多传感器+风流逆转等联合条件 |

**判断依据**（`src/constants/kpi.js` → `determineAlarmLevel()`）：

```javascript
/**
 * 综合判定报警级别
 * @param {number} value - 监测值
 * @param {number} alarmThreshold - 报警门限
 * @param {number} cutoffThreshold - 断电门限
 * @param {number} changeRate - 变化率
 * @returns {number} 报警级别 0-4
 */
function determineAlarmLevel(value, alarmThreshold, cutoffThreshold, changeRate) {
  const LEVEL_0 = 0, LEVEL_1 = 1, LEVEL_2 = 2, LEVEL_3 = 3;
  if (value < alarmThreshold) return LEVEL_0;
  if (value < cutoffThreshold) return LEVEL_1;
  if (changeRate > 0.1) return LEVEL_3;
  return LEVEL_2;
}
```

---

## 十一、监测点列表交互

- **表头布局** — 左侧 SVG 图标 + "监测点列表" + `共 N 条` + 可选过滤标签（活动类别/区域 + ×清除按钮），右侧 [更多>] 按钮
- **[更多>] 按钮** — `location.href = '/safetyMonitoringMore'` 跳转到监测点全量页面
- **无区域列** — 表格列: `点号 | 名称 | 状态值(含单位) | 时间 | 状态`，区域仅用于排序/过滤，不作为独立列显示
- **行左侧发光条** — 每行 `::before` 伪元素生成 3px 垂直渐变条 + `box-shadow` 发光，颜色通过 CSS 自定义属性 `--mpl-glow` / `--mpl-glow-soft` 根据行状态类名设置：
  - 正常: 绿 `#22c55e`
  - Lv1 预警: 黄 `#eab308`
  - Lv2 报警: 红 `#ef4444`
  - Lv3 紧急: 橙 `#f97316` + `l3-glow` 脉冲动画
  - Lv4 突出: 紫 `#a855f7` + `l4-glow` 快脉冲动画
  - 故障: 琥珀 `#f59e0b`
  - 离线: 灰 `#64748b` 降低透明度
  - 分站: 蓝 `#3b82f6`
- **状态值颜色** — `.is-level-1` 黄 / `.is-level-2` 红 / `.is-level-3` 橙 / `.is-level-4` 紫 / `.is-fault` 琥珀 / `.is-offline` 灰 / `.is-substation` 蓝
- **状态值含单位** — `displayStateText(item)` 函数逻辑：读取 `item.categoryStateText`（父模块 map 阶段通过 `buildStateText()` 填充），若为数值则附加 `item.unit`（如 `"0.04 %CH4"`），否则直接渲染文本
- **`categoryStateText` 契约** — 主模块 `fetchAll()` map 阶段调用 `buildStateText(item, unit, dv)` 为每条记录预计算展示文本，`MonitoringPointList` 模块仅消费此字段，保持展示逻辑在主模块、渲染在子模块的职责分离
- **客户端过滤/排序/分页** — 纯 JS 实现：先按 `filterCategory` + `filterArea` 过滤，再排序（报警 > 故障 > 正常，再按区域、站号），`pagedItems` sliced 后渲染；监听过滤/分页变化自动回第 1 页
- **字体大小** — 列文本 `13px`，状态标签 `12px`，表头 `14px`，图例 `12px`，计数 `12px`，点号/名称/时间/状态值列使用等宽字体；响应式：状态值列宽 `110px` → `90px` (1280px) → `80px` (900px)
- **全量拉取 + 客户端分页** — 仪表盘一次性拉取全部 ~500+ 记录到 `monitorItems` 数组，`MonitoringPointList` 模块执行客户端分页，实现即时过滤/区域点击无重新请求
- **分页控件** — 原生 HTML 手写分页组件，支持 `[20, 50, 100, 200, 500]` 页大小，显示：总数、每页条数选择、上一页/下一页、页码跳转

---

## 十二、策略 API 全表

### 安全监测模块

| 策略 ID | 端点 | 函数 | 参数 | 用途 |
|---------|------|------|------|------|
| **1954** | page | `listSafetyMonitoring(query)` | StartRow, PageRowNums, style, MineName, AlarmType, Station, DevType, CategoryName, Area, Address | ⭐ 监测点分页列表 |
| **8453** | data | `getKpiData()` | MineName | ⭐ KPI 统计 |
| **1942** | data | `getData()` | MineName | ⭐ 分类柱状图（bar.js） |
| **1960** | page | `listEalTimeAlarm()` | MineName, StartRow=1, PageRowNums=10 | ⭐ 实时告警（ealTimeAlarm.js） |
| **1963** | page | `listHistoricalAlarm(query)` | MineName, StartRow, PageRowNums, Address, DevType, CategoryName, startTime, endTime | ⭐ 历史报警查询（ealTimeAlarm.js） |
| 1938 | data | `substationSelect()` | MineName | 分站下拉 |
| 1940 | data | `typeSelect()` | MineName | 类型下拉 |
| 1947 | data | `categorySelect(type?)` | MineName, CmbDevType | 类别下拉 |
| 1961 | data | `areaSelect()` | MineName | 区域下拉 |
| 1964 | data | `siteSelect()` | MineName | 地点下拉 |
| 1964 | data | `substationInfo(devLabel)` | MineName, DevLabel | 分站详情（devLabel 含 F） |
| 1965 | data | `getSafetyMonitoringTotal()` | MineName, IsCallThePolice | 总数 |
| 1965 | data | `monitoringPointInfo(devLabel)` | MineName, DevLabel | 监测点详情 |

### 请求格式

```json
{
  "id": 1954,
  "parameter": [
    { "name": "MineName", "value": "山西保安煤业" },
    { "name": "StartRow", "value": 1 },
    { "name": "PageRowNums", "value": 20 }
  ]
}
```

### 响应格式

```json
{
  "code": 100,
  "data": { "total": 573, "items": [...] }
}
```

---

## 十三、策略 1954 — 监测点分页列表（含默认值）

**调用入口：** `listSafetyMonitoring(query)` → `api/system/safetyMonitoring.js`

### 参数说明及默认值

| 前端参数 | 下发参数名 | 类型 | 默认值 | 处理后下发值 | 说明 |
|----------|-----------|------|--------|-------------|------|
| `pageNum` | `StartRow` | number | `1` | `1` | 起始行号 |
| `pageSize` | `PageRowNums` | number | `20` | `20` | 每页行数 |
| `theme` | `style` | string | `'theme-dark'` | `"theme-dark"` | 主题样式 |
| — | `MineName` | string | cookie 自动获取 | `"山西保安煤业"` | 矿井名称（自动注入） |
| `isCallThePolice` | `AlarmType` | string | `''` | `""` | 空=全部，`"1"`=报警，`"0"`=正常 → `praseStrEmpty` |
| `substation` | `Station` | string | `''` | `"0"` | 空=全部分站，`"1"`/`"2"`…=指定分站 → `praseStrZero` |
| `type` | `DevType` | string | `''` | `"0"` | 空=全部类型，`"模拟量"`/`"开关量"` → `praseStrZero` |
| `category` | `CategoryName` | string[] | `[]` | `0` | 空数组→`0`(全部)，`["瓦斯","一氧化碳"]`→`"瓦斯,一氧化碳"` |
| `area` | `Area` | string | `''` | `""` | 空=全部区域，输入即模糊匹配 → `praseStrEmpty` |
| `site` | `Address` | string | `''` | `""` | 空=全部地点，输入即模糊匹配 → `praseStrEmpty` |

> **`praseStrEmpty(str)`: ** `str || ''` — 空字符串直接下发空字符串
> **`praseStrZero(str)`: ** `String(str || 0)` — 空字符串转为 `"0"`（表示「全部」）

### 默认参数下发请求体

```json
{
  "id": 1954,
  "parameter": [
    { "name": "StartRow",      "value": 1 },
    { "name": "PageRowNums",   "value": 20 },
    { "name": "style",         "value": "theme-dark" },
    { "name": "MineName",      "value": "山西保安煤业" },
    { "name": "AlarmType",     "value": 0 },
    { "name": "Station",       "value": 0 },
    { "name": "DevType",       "value": 0 },
    { "name": "CategoryName",  "value": 0 },
    { "name": "Area",          "value": "" },
    { "name": "Address",       "value": "" }
  ]
}
```

### 典型筛选调用示例

```javascript
// 仅查询报警点
listSafetyMonitoring({ pageNum: 1, pageSize: 100, isCallThePolice: '1' });

// 按分站+类别筛选
listSafetyMonitoring({ pageNum: 1, pageSize: 100, substation: '1', type: '模拟量', category: ['瓦斯'] });

// 按区域关键词搜索
listSafetyMonitoring({ pageNum: 1, pageSize: 100, area: '采煤工作面' });
```

---

## 十四、策略 8453 — KPI 统计

**调用入口：** `getKpiData()` → `api/system/safetyMonitoring.js`

### 请求参数

| 下发参数名 | 类型 | 默认值 | 下发值 | 说明 |
|-----------|------|--------|--------|------|
| `MineName` | string | cookie 自动获取 | `"山西保安煤业"` | 矿井名称 |

### 请求体

```json
{
  "id": 8453,
  "parameter": [
    { "name": "MineName", "value": "山西保安煤业" }
  ]
}
```

### 返回字段

```json
{
  "total": 535,
  "analog": 313,
  "switch": 222,
  "substation": 38,
  "alarmPoint": 2,
  "devicesNeedCalibration": 0
}
```

> `res.data` 直接是对象，无 `items` 包装。

---

## 十五、策略 1942 — 分类统计

**调用入口：** `getData()` → `api/system/bar.js`

### 请求参数

| 下发参数名 | 类型 | 默认值 | 下发值 | 说明 |
|-----------|------|--------|--------|------|
| `MineName` | string | cookie 自动获取 | `"山西保安煤业"` | 矿井名称 |

### 请求体

```json
{
  "id": 1942,
  "parameter": [
    { "name": "MineName", "value": "山西保安煤业" }
  ]
}
```

### 返回示例

```json
{
  "code": 100,
  "data": [
    { "txt": "全部", "num": 573 },
    { "txt": "瓦斯", "num": 128 },
    { "txt": "一氧化碳", "num": 45 }
  ]
}
```

> `res.data` 直接是数组，前端需 `data.filter(d => d.txt !== '全部')` 过滤汇总行。

---

## 十六、策略 1960 — 实时报警

**调用入口：** `listEalTimeAlarm()` → `api/system/ealTimeAlarm.js`

### 请求参数

| 下发参数名 | 类型 | 默认值 | 下发值 | 说明 |
|-----------|------|--------|--------|------|
| `MineName` | string | cookie 自动获取 | `"山西保安煤业"` | 矿井名称 |
| `StartRow` | number | **固定** `1` | `1` | 起始行 |
| `PageRowNums` | number | **固定** `10` | `10` | 每页行数（不可改） |

> 更多分页用 `listMoreEalTimeAlarm({ pageNum, pageSize })`，参数相同、仅 StartRow/PageRowNums 可变。

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

### 返回字段

| 字段 | 类型 | 示例 |
|------|------|------|
| `devLabel` | string | `"014D09"` |
| `devAddress` | string | `"150114高抽巷掘进面主用风机一级局部通风机"` |
| `devType` | string | `"开关量"` |
| `categoryName` | string | `"局扇"` |
| `alarmType` | string | `"0态报警"` |
| `alarmBeginDT` | string | `"2026-05-30 17:51:13.000"` |
| `valueText` | string | `"停"` |

---

## 十七、策略 1963 — 历史报警查询

**调用入口：** `listHistoricalAlarm(query)` → `api/system/ealTimeAlarm.js`

### 使用位置

**AlarmTimeline 内置历史弹窗** — 点击告警面板顶部 [历史 →] 按钮打开，首次打开时初始化 3 天日期范围（使用 `getRecentDayRange(3)` 计算），拉取类型下拉（`typeSelect()`）并执行 `searchHistory()`。

### 请求参数

| 前端字段 | 下发参数名 | 类型 | 默认值 | 说明 |
|----------|-----------|------|--------|------|
| `MineName` | `MineName` | string | cookie 自动获取 | 矿井名称 |
| `pageNum` | `StartRow` | number | `1` | 页码（非偏移量，按页号发送） |
| `pageSize` | `PageRowNums` | number | `20` | 每页行数 |
| `address` | `Address` | string | `''` | 地点/地址模糊匹配（`praseStrEmpty`） |
| `typeName` | `DevType` | string | `'0'` | 设备类型，空 → `'0'`（全部） |
| `category` | `CategoryName` | string | `'0'` | 类别，空 → `'0'`（全部） |
| `startTime` | `startTime` | string | — | 起始时间 `"YYYY-MM-DD HH:mm:ss"` |
| `endTime` | `endTime` | string | — | 结束时间 `"YYYY-MM-DD HH:mm:ss"` |

### 请求体示例

```json
{
  "id": 1963,
  "parameter": [
    { "name": "MineName", "value": "山西保安煤业" },
    { "name": "StartRow", "value": 1 },
    { "name": "PageRowNums", "value": 20 },
    { "name": "Address", "value": "" },
    { "name": "DevType", "value": "0" },
    { "name": "CategoryName", "value": "0" },
    { "name": "startTime", "value": "2026-06-21 00:00:00" },
    { "name": "endTime", "value": "2026-06-24 23:59:59" }
  ]
}
```

### 弹窗筛选栏

三个筛选控件，均为原生 HTML 元素：

| 控件 | HTML 元素 | 绑定字段 | 说明 |
|------|----------|---------|------|
| 地点 | `<input type="text">` | `historyFilter.address` | 模糊匹配 |
| 类型 | `<select>` 下拉框 | `historyFilter.typeName` | 选项来自 `typeSelect()` API（strategy 1940） |
| 时间范围 | 两个 `<input type="datetime-local">` | `historyFilter.startTime / endTime` | 日期时间选择 |

分页使用手写分页控件，绑定 `historyTotal` + `historyFilter.pageNum/pageSize`。

---

## 十八、下拉框/详情接口

> 全部为 `data` 端点，返回格式统一：`{ code: 100, data: [{ txt: "显示名", val: "值" }] }`
> 详情接口返回：`res.data[0] = { ... }`（单对象数组）

| 策略 ID | 函数 | 参数 | 默认值 | 下发值 |
|---------|------|------|--------|--------|
| 1938 | `substationSelect()` | `MineName` | cookie | `"山西保安煤业"` |
| 1940 | `typeSelect()` | `MineName` | cookie | `"山西保安煤业"` |
| 1947 | `categorySelect(type?)` | `MineName, CmbDevType` | `type=''` | `CmbDevType=""` → `praseStrEmpty` |
| 1961 | `areaSelect()` | `MineName` | cookie | `"山西保安煤业"` |
| 1964 | `siteSelect()` / `substationInfo(label)` | `MineName, DevLabel` | — | — |
| 1965 | `getSafetyMonitoringTotal()` / `monitoringPointInfo(label)` | `MineName, IsCallThePolice/DevLabel` | — | — |

**调用示例：**

```javascript
// 全部类别
const res = await categorySelect();           // CmbDevType="" → praseStrEmpty → ""

// 仅模拟量类别
const res = await categorySelect('模拟量');    // CmbDevType="模拟量"

// 分站详情（devLabel 含 F）
const res = await substationInfo('001F01');   // DevLabel="001F01"

// 监测点详情
const res = await monitoringPointInfo('001A05');  // DevLabel="001A05"
```

---

## 十九、SSO 单点登录

### 19.1 SDK 引入

部署时在入口 HTML 的 `<head>` 中手动插入脚本标签：

```html
<script src="/net/Content/Resource/SDK/bw.sso.sdk.js"></script>
```

（原 Vite 构建时由自定义插件 `vite-plugin/injectSsoSdk.ts` 自动注入，现为手动 `<script>` 标签直接写入 HTML）

### 19.2 全局对象

引入后在 `window` 上生成 `BW_SSO_SDK`，包含两个方法：

| 方法 | 参数 | 说明 |
|------|------|------|
| `BW_SSO_SDK.SSOLogin` | `hostname, port, callback` | 单点登录 |
| `BW_SSO_SDK.SSOLogout` | `hostname, port` | 退出登录 |

### 19.3 登录流程

**入口：** 入口 HTML 的 `<script>` 块中，`DOMContentLoaded` 之前调用 `bwSSOSDKLogin(callback)`

```
bwSSOSDKLogin(callback)
├─ URL 含 mine_key 参数？
│   └─ 是 → 直接 callback()，跳过 SSO
│
├─ window.BW_SSO_SDK 可用？
│   └─ 否 → console.warn，不初始化页面
│
└─ BW_SSO_SDK.SSOLogin(hostname, port, callback)
    └─ 成功 → callback() → 初始化页面
    └─ 失败 → callback() → 继续初始化（后续由路由守卫逻辑拦截处理）
```

### 19.4 调用示例

**登录：**

```javascript
BW_SSO_SDK.SSOLogin(
  window.location.hostname,  // "192.163.5.10"
  window.location.port,      // "8080"
  (data) => {
    if (!data) return;
    // data 结构
    // {
    //   "userInfo": {
    //     "username": "JQDWXT",
    //     "realname": "管理员(JQDWXT)",
    //     "mineName": "精确定位系统",
    //     "mineDesc": "JQDWXT"
    //   }
    // }
    console.log(data.userInfo.username);  // "JQDWXT"
    console.log(data.userInfo.mineName);  // "精确定位系统"
  }
);
```

**退出登录：**

```javascript
BW_SSO_SDK.SSOLogout(
  window.location.hostname,
  window.location.port
);
```

### 19.5 Token 存储

登录成功后，SDK 自动写入：

| 存储位置 | Key | 有效期 | 说明 |
|----------|-----|--------|------|
| Cookie | `Access-Token` | 5 天 | 后端鉴权 |
| localStorage | `token` | 5 天 | 前端状态判断 |

**重要：** 第三方应用**不允许修改**这两个变量。

前端读 token 的函数（`utils/auth.js`、`utils/cookie.js`）：

```javascript
// 从 localStorage 读取
export function getToken() {
  return (localStorage.getItem('token') || '').replace(/"/g, '') || null;
}

// 从 cookie 读取（含 MineName 等信息）
export function getMineName() {
  // 从 cookie "MineName" 获取，缓存到内存变量
  const match = document.cookie.match(/(?:^|;\s*)MineName=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}
```

### 19.6 路由守卫

原生 JS 实现 URL hash 路由守卫（替代 Vue Router 的 `beforeEach`）：

```
页面初始化
├─ URL 含 mine_key
│   ├─ Base64 解码 → username;password
│   ├─ userStore.login() 调用后端 /api/login
│   └─ 重定向到去除 mine_key 的原始路径
│
├─ 有 token（cookie 或 localStorage）
│   └─ 放行，正常渲染页面
│
├─ 白名单路径（/login）
│   └─ 放行
│
└─ 均不满足
    ├─ BW_SSO_SDK 存在 → SSOLogout() 清理登录态
    └─ BW_SSO_SDK 不存在 → 放行（后端拦截处理）
```

路由守卫通过 `window.location.hash` 或 `window.location.pathname` 判断当前路径，在页面初始化脚本中运行。

### 19.7 fetch 请求头

每次 `fetch()` 调用自动附加请求头：

```javascript
// utils/request.js
export function createHeaders() {
  return {
    'Content-Type': 'application/json',
    'caller': 'WebMineManage',
    'token': getToken() || ''  // 从 localStorage 读取
  };
}
```

---

## 二十、文件索引

### 原生 HTML/CSS/JS 项目结构

```
views/system/safetyMonitoring/
├─ index.html                      ← 主仪表盘 HTML 结构（70/30 分栏布局）
├─ index.css                       ← 主仪表盘样式
├─ index.js                        ← 主仪表盘逻辑（初始化、轮询、数据分发）
│
├─ api/
│  ├─ helpers.js                   ← 共用：requestStrategyData() + getMineName() + praseStrEmpty/Zero
│  ├─ safetyMonitoring.js          ← 策略 1938/1940/1947/1954/1961/1964/1965/8453
│  ├─ ealTimeAlarm.js              ← 策略 1960（实时）/ 1963（历史）
│  └─ bar.js                       ← 策略 1942
│
├─ utils/
│  ├─ auth.js                      ← getToken() / setToken() / removeToken()
│  ├─ cookie.js                    ← getMineName() / getToken() / getMineDesc()
│  ├─ request.js                   ← createHeaders() + fetch 封装 + 错误处理
│  ├─ sso.js                       ← bwSSOSDKLogin(callback) 登录入口
│  ├─ constants.js                 ← DATA_THEME / TOKEN_KEY 常量
│  ├─ errorCode.js                 ← 错误码 → 中文消息映射
│  ├─ style.js                     ← tableRowClassName 表格隔行变色
│  └─ util.js                      ← formatDateTime() / getRecentDayRange() 等日期工具
│
├─ constants/
│  └─ kpi.js                       ← ALARM_LEVELS + SENSOR_UNITS + determineAlarmLevel
│
├─ stores/
│  ├─ settings.js                  ← 主题状态：{ currentTheme: 'theme-dark' }，读写 localStorage
│  ├─ app.js                       ← 应用状态：{ isMobile, sidebarOpen, histPopup }
│  └─ user.js                      ← 用户状态：{ token, username, mineName }，含 login() / logout()
│
└─ components/
    ├─ HeroCard/
    │   ├─ HeroCard.html            ← KPI 卡片 HTML 结构
    │   ├─ HeroCard.css             ← KPI 卡片样式（毛玻璃 + glow orb + 色变体）
    │   └─ HeroCard.js              ← KPI 卡片创建函数
    │
    ├─ MonitoringPointList/
    │   ├─ MonitoringPointList.html ← 监测点列表 HTML 结构
    │   ├─ MonitoringPointList.css  ← 监测点列表样式（行发光条、分级着色）
    │   └─ MonitoringPointList.js   ← 监测点列表逻辑（客户端分页/过滤/排序）
    │
    ├─ StatusRing/
    │   ├─ StatusRing.html
    │   ├─ StatusRing.css
    │   └─ StatusRing.js            ← 环形图 Canvas 绘制 / ECharts CDN
    │
    ├─ CategoryBar/
    │   ├─ CategoryBar.html
    │   ├─ CategoryBar.css
    │   └─ CategoryBar.js           ← 水平柱状图 + 点击筛选
    │
    ├─ AlarmTimeline/
    │   ├─ AlarmTimeline.html       ← 告警时间线 HTML 结构 + 内置历史查询弹窗
    │   ├─ AlarmTimeline.css        ← L3/L4 徽章、LIVE 脉冲、分级色标样式
    │   └─ AlarmTimeline.js         ← 告警时间线逻辑 + 历史查询
    │
    ├─ OutburstWarning/
    │   ├─ OutburstWarning.html     ← 突出预警条 HTML
    │   ├─ OutburstWarning.css      ← 红色闪烁动画
    │   └─ OutburstWarning.js       ← 多条件联合判断逻辑
    │
    ├─ FeedStatusPanel/
    │   ├─ FeedStatusPanel.html     ← 馈电面板 HTML（可展开/折叠）
    │   ├─ FeedStatusPanel.css
    │   └─ FeedStatusPanel.js
    │
    ├─ ReportPanel/
    │   ├─ ReportPanel.html         ← 日报表弹窗 HTML
    │   ├─ ReportPanel.css
    │   └─ ReportPanel.js
    │
    ├─ AlarmLevelBadge/
    │   ├─ AlarmLevelBadge.html
    │   ├─ AlarmLevelBadge.css
    │   └─ AlarmLevelBadge.js       ← 分级标签徽章渲染
    │
    ├─ StationMatrix/
    │   ├─ StationMatrix.html       ← 分站矩阵（预留）
    │   ├─ StationMatrix.css
    │   └─ StationMatrix.js
    │
    ├─ GradeAlarmPanel/
    │   ├─ GradeAlarmPanel.html     ← 分级报警面板（未在仪表盘中使用）
    │   ├─ GradeAlarmPanel.css
    │   └─ GradeAlarmPanel.js
    │
    ├─ SwitchStateChart/
    │   ├─ SwitchStateChart.html    ← 开关量状态图（未在仪表盘中使用）
    │   ├─ SwitchStateChart.css
    │   └─ SwitchStateChart.js
    │
    ├─ TrendChart/
    │   ├─ TrendChart.html          ← 趋势曲线（预留）
    │   ├─ TrendChart.css
    │   └─ TrendChart.js
    │
    └─ SafetyMonitoringDetail/
        ├─ index.html               ← 详情弹窗 HTML（策略 1964/1965）
        ├─ index.css
        └─ index.js

css/
├─ main.css                         ← 全局 CSS 变量 + 主题系统（:root, [data-theme='theme-dark'], [data-theme='theme-light']）
├─ reset.css                        ← CSS Reset / Normalize
└─ common.css                       ← 公共样式类

design-system/
├─ MASTER.md                         ← 全局设计系统
└─ pages/safetyMonitoring.md         ← 安全监测页面设计覆盖

docs/SafetyMonitoring/
├─ API文档.md                        ← API 详细文档
├─ 策略API速查.md                     ← 策略 ID 速查
└─ 安全监测界面设计及API文档.md        ← 本文档
```

### 入口 HTML 示例

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="theme-dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>煤矿安全监测</title>
  <!-- SSO SDK -->
  <script src="/net/Content/Resource/SDK/bw.sso.sdk.js"></script>
  <!-- ECharts CDN（可选，图表组件按需加载） -->
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js"></script>
  <!-- 全局样式 -->
  <link rel="stylesheet" href="/css/reset.css">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/common.css">
</head>
<body>
  <div id="app">
    <!-- 由 index.js 动态渲染 -->
  </div>

  <!-- 模块脚本（ES6 模块） -->
  <script type="module" src="/views/system/safetyMonitoring/index.js"></script>
</body>
</html>
```

### 组件模式示例

每个组件文件夹采用一致的文件结构：

```javascript
// components/HeroCard/HeroCard.js

/**
 * 创建 KPI 统计卡片
 * @param {HTMLElement} container - 挂载容器
 * @param {Object} config - 配置项
 * @param {string} config.title - 卡片标题
 * @param {string|number} config.value - 数值
 * @param {string} [config.icon] - SVG 图标字符串
 * @param {string} [config.variant] - 色变体: 'normal'|'warning'|'danger'|'info'
 * @param {Array<{label: string, count: number}>} [config.badges] - 子徽章列表
 */
export function createHeroCard(container, config) {
  container.innerHTML = `
    <div class="hero-card hero-card--${config.variant || 'normal'}">
      <div class="hero-card__header">
        ${config.icon ? `<span class="hero-card__icon">${config.icon}</span>` : ''}
        <span class="hero-card__title">${config.title}</span>
      </div>
      <div class="hero-card__value">${config.value}</div>
    </div>
  `;
}

/**
 * 更新卡片数值
 * @param {HTMLElement} container - 已渲染的卡片容器
 * @param {string|number} value - 新数值
 */
export function updateHeroCard(container, value) {
  const el = container.querySelector('.hero-card__value');
  if (el) el.textContent = String(value);
}
```

### 状态管理模式

替代 Pinia stores 的纯 JS 状态对象模式：

```javascript
// stores/settings.js
const SETTINGS_KEY = 'app_settings';

/** @type {{ currentTheme: string }} */
const state = {
  currentTheme: localStorage.getItem(SETTINGS_KEY + '_theme') || 'theme-dark'
};

export const settingsStore = {
  get theme() { return state.currentTheme; },
  setTheme(theme) {
    state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(SETTINGS_KEY + '_theme', theme);
  }
};

// stores/user.js
const TOKEN_KEY = 'token';

export const userStore = {
  token: localStorage.getItem(TOKEN_KEY)?.replace(/"/g, '') || null,
  username: '',
  mineName: '',

  async login(credentials) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (res.ok) {
      const data = await res.json();
      this.token = data.token;
      this.username = data.username;
      this.mineName = data.mineName;
      localStorage.setItem(TOKEN_KEY, data.token);
    }
  },

  logout() {
    this.token = null;
    this.username = '';
    this.mineName = '';
    localStorage.removeItem(TOKEN_KEY);
  }
};
```
