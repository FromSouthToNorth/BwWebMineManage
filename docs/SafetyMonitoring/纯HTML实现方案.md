---
name: bw-childsys-dashboard-aqjc
description: "安全监测大屏生成。含KPI卡片、双表单监测点列表(各35%布局、对半拆分数据)、环形图、柱状图、告警时间线(L3/L4徽章+历史弹窗)等。对标AQ6201-2019/AQ1029-2019标准。"
---

# 安全监测系统大屏生成技能

## 技能概述

根据安全监测系统的数据源信息，自动生成可视化大屏界面。

**⚠️ 必须遵循通用规范：** [references/dashboard-common-rules.md](references/dashboard-common-rules.md)

**🔑 MineName 获取方式（所有策略 API 必需）：** SSO 登录成功后，后端将 `MineName` 写入浏览器 cookie。前端通过 `getMineName()` 从 cookie 读取并缓存到内存，所有 `callStrategy()` 调用自动使用该值作为 `MineName` 参数，无需硬编码。兜底方案：从 `localStorage.getItem('pro__MineName')` 读取。

**设计对标标准：**
- **AQ6201-2019** 煤矿安全监控系统通用技术要求
- **AQ1029-2019** 煤矿安全监控系统及检测仪器使用管理规范

## 触发条件

- "生成安全监测大屏"
- "创建安全监测界面"
- "做安全监测系统的大屏"

## 设计对标标准

本界面设计依据以下国家安全生产行业标准：

| 标准号 | 名称 | 年份 | 角色 |
|--------|------|------|------|
| **AQ 6201** | 煤矿安全监控系统通用技术要求 | 2019（替代 2006） | 功能需求来源 |
| **AQ 1029** | 煤矿安全监控系统及检测仪器使用管理规范 | 2019（替代 2007） | 传感器设置 + 运维规范 |

### AQ6201-2006 → 2019 关键变化

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

### AQ1029-2007 → 2019 关键变化

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

## 生成流程

### 第一步：确认数据源

通过策略API获取数据：

```javascript
// 从 cookie 读取矿井名称（SSO 登录后自动写入）
function getMineName() {
  if (getMineName._cached) return getMineName._cached;
  var name = getCookie('MineName');
  if (!name) name = localStorage.getItem('pro__MineName') || '';
  getMineName._cached = name;
  return name;
}

// 日期时间辅助函数（用于策略8455历史趋势）
function formatDateTime(d) {
  var Y = d.getFullYear();
  var M = String(d.getMonth() + 1).padStart(2, '0');
  var D = String(d.getDate()).padStart(2, '0');
  var h = String(d.getHours()).padStart(2, '0');
  var m = String(d.getMinutes()).padStart(2, '0');
  var s = String(d.getSeconds()).padStart(2, '0');
  return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
}
function getNow() { return formatDateTime(new Date()); }
function getThreeHoursAgo() {
  var d = new Date();
  d.setHours(d.getHours() - 3);
  return formatDateTime(d);
}
```

```javascript
// 1. 监测点列表（策略1954）— 指定数量拉取，分页使用API
// 参数处理：praseStrEmpty(str) = str || ''，praseStrZero(str) = String(str || 0)
// StartRow = (当前页 - 1) * 每页条数 + 1
// ⚠️ PageRowNums 为两表总和，前端拆分为 form1(前一半) + form2(后一半)
//    例：PageRowNums=20 → 表单一10条 + 表单二10条
//        PageRowNums=50 → 表单一25条 + 表单二25条
//        PageRowNums=100 → 表单一50条 + 表单二50条
callStrategy(1954, [
  {name: "StartRow", value: 1},           // 起始行，动态计算：(page-1)*pageSize+1
  {name: "PageRowNums", value: 50},       // 每页条数(两表总和)，默认50，可选[20,50,100,200]
  {name: "style", value: "theme-dark"},   // 主题样式
  {name: "MineName", value: getMineName()}, // ⬅ 从浏览器 cookie 读取（SSO 登录后自动写入）
  {name: "AlarmType", value: 0},          // 报警类型：0=全部，"1"=报警，"0"=正常 → praseStrEmpty
  {name: "Station", value: 0},            // 分站：0=全部，"1"/"2"...=指定 → praseStrZero
  {name: "DevType", value: 0},            // 设备类型：0=全部，"模拟量"/"开关量" → praseStrZero
  {name: "CategoryName", value: 0},       // 类别：0=全部，["瓦斯","一氧化碳"]→"瓦斯,一氧化碳"
  {name: "Area", value: ""},              // 区域：空=全部，输入即模糊匹配 → praseStrEmpty
  {name: "Address", value: ""}            // 地点：空=全部，输入即模糊匹配 → praseStrEmpty
]);

// 2. KPI统计数据（策略8453）— ⚠️ 返回数组，取第一个元素
callStrategy(8453, [
  {name: "MineName", value: getMineName()}
]);
// 处理：kpiData = Array.isArray(kpiRes) ? (kpiRes[0] || {}) : (kpiRes || {});

// 3. 分类统计（策略1942）
// 返回格式：[{txt: "全部", num: 573}, {txt: "瓦斯", num: 128}, ...]
// 前端需 filter(d => d.txt !== '全部') 过滤汇总行
callStrategy(1942, [
  {name: "MineName", value: getMineName()}
]);

// 4. 实时告警（策略1960）
// StartRow/PageRowNums 固定为 1/10，更多分页用 listMoreEalTimeAlarm
callStrategy(1960, [
  {name: "MineName", value: getMineName()},
  {name: "StartRow", value: 1},
  {name: "PageRowNums", value: 10}
]);

// 4b. 历史趋势（策略8455）— 监测点历史曲线数据
// 用于图表卡片：实时监测趋势图（D3 折线图）
// 时间范围默认前3小时，间隔5分钟，约36个数据点
// dt_begin/dt_end 格式：'YYYY-MM-DD HH:mm:ss'
// point_name: 设备点名，空=全部，支持单个名称如"T1_甲烷"（来自1954的devLabel或detectionParam）
// ⚠️ 返回扁平数组 [{keyname, dt, value}, ...]（不是嵌套结构）
//    devType=模拟量 → categoryName如"瓦斯" 单位%CH4 / "一氧化碳" 单位ppm
//    devType=开关量 → categoryName如"馈电" 值1=有电/0=断电 / "开停" 1=开/0=停
callStrategy(8455, [
  {name: "MineName", value: getMineName()},
  {name: "dt_begin", value: getThreeHoursAgo()},     // 默认当前时间前3小时
  {name: "dt_end", value: getNow()},                  // 默认当前时间
  {name: "point_name", value: ""},                    // 设备点名，空=全部
  {name: "interval_minute", value: 5}                 // 数据间隔分钟数，默认5
]);
// 处理：trendData = Array.isArray(res) ? res : [];

// --- 历史趋势假数据（开发/演示用，无需后端） ---
// 当后端不可用时，调用 getMockTrendData() 返回模拟 8455 格式数据
// 用法：callStrategy(8455, ...).catch(() => getMockTrendData(point_name))
// 或：var data = isDemo ? getMockTrendData('') : await callStrategy(8455, ...)
function getMockTrendData(point_name) {
  var devices = [
    { keyname: 'SXBAMY0030120001A03', name: '地面洗选精煤仓3#煤仓上口甲烷_激光甲烷', devType: '模拟量', category: '瓦斯', unit: '%CH4', base: 0.6, amp: 0.3, noise: 0.08, alarm: 1.0, cutoff: 1.5 },
    { keyname: 'SXBAMY0030120007B01', name: '102#掘进面回风_CO', devType: '模拟量', category: '一氧化碳', unit: 'ppm', base: 12, amp: 6, noise: 2, alarm: 24, cutoff: 48 },
    { keyname: 'SXBAMY0030120005C03', name: '主斜井_风速', devType: '模拟量', category: '风速', unit: 'm/s', base: 4.5, amp: 1.2, noise: 0.3, alarm: 8, cutoff: 12 },
    { keyname: 'SXBAMY0030120008D01', name: '机电硐室_温度', devType: '模拟量', category: '温度', unit: '℃', base: 26, amp: 4, noise: 0.5, alarm: 35, cutoff: 45 },
    { keyname: 'SXBAMY0030120007D02', name: '102#掘进面_馈电', devType: '开关量', category: '馈电', unit: '', base: 1, amp: 0, noise: 0 },
    { keyname: 'SXBAMY0030120007D03', name: '102#掘进面_开停', devType: '开关量', category: '开停', unit: '', base: 1, amp: 0, noise: 0 },
  ];
  // 如果传入了 point_name，只返回匹配的设备
  if (point_name) {
    devices = devices.filter(function(d) { return d.keyname === point_name || d.name.indexOf(point_name) !== -1; });
    if (!devices.length) devices = [{ keyname: point_name, devType: '模拟量', category: '瓦斯', base: 0.5, amp: 0.2, noise: 0.05 }];
  }
  var result = [], now = Date.now();
  devices.forEach(function(dev) {
    for (var i = 36; i >= 0; i--) {
      var t = new Date(now - i * 5 * 60000);
      var angle = (i / 12) * Math.PI * 2;
      var val;
      if (dev.devType === '开关量') {
        // 开关量: 大部分时间 1，偶尔跳变 0
        val = (i >= 5 && i <= 8) || (i >= 20 && i <= 22) ? 0 : 1;
      } else {
        val = Math.max(0, dev.base + Math.sin(angle) * dev.amp + (Math.random() - 0.5) * dev.noise);
        val = +val.toFixed(3);
      }
      result.push({
        keyname: dev.keyname,
        dt: t.getFullYear() + '-' + String(t.getMonth()+1).padStart(2,'0') + '-' + String(t.getDate()).padStart(2,'0') + ' ' +
            String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0') + ':00.000',
        value: val
      });
    }
  });
  return result;
}


// 5. 历史报警查询（策略1963）— AlarmTimeline 内置历史弹窗使用
callStrategy(1963, [
  {name: "MineName", value: getMineName()},
  {name: "StartRow", value: 1},
  {name: "PageRowNums", value: 20},
  {name: "Address", value: ""},
  {name: "DevType", value: "0"},
  {name: "CategoryName", value: "0"},
  {name: "startTime", value: "2026-06-21 00:00:00"},
  {name: "endTime", value: "2026-06-24 23:59:59"}
]);

// 6. 下拉框接口（返回格式：{code:100, data:[{txt:"显示名", val:"值"}]}）
callStrategy(1938, [{name: "MineName", value: getMineName()}]);  // 分站下拉
callStrategy(1940, [{name: "MineName", value: getMineName()}]);  // 类型下拉（⚠️ val为数字，前端用txt作为value）
callStrategy(1947, [{name: "MineName", value: getMineName()}, {name: "CmbDevType", value: ""}]);  // 类别下拉（⚠️ 可能返回空，改用数据提取）
callStrategy(1961, [{name: "MineName", value: getMineName()}]);  // 区域下拉
callStrategy(1964, [{name: "MineName", value: getMineName()}, {name: "DevLabel", value: ""}]);  // 地点下拉/分站详情
callStrategy(1965, [{name: "MineName", value: getMineName()}, {name: "DevLabel", value: ""}]);  // 监测点详情
```

**⚠️ 下拉框绑定注意事项：**
- **设备类型（策略1940）**：返回 `val` 为数字（如 `"1"`、`"2"`），前端需用 `txt` 作为 option value（如 `"模拟量"`、`"开关量"`），传给 API 的 `DevType` 参数也是文本
- **类别（策略1947）**：可能返回空数组，建议从策略1954返回的数据中提取 `categoryName` 去重作为类别选项
- **区域**：更多弹窗中使用输入框而非下拉选择，支持模糊搜索

### 第二步：生成大屏

基于模板生成 HTML 大屏文件，必须同时满足：
1. **通用规范**（references/dashboard-common-rules.md）
2. **专项规范**（本技能下方定义）

### 第三步：输出

**输出路径：** 大屏文件保存在本技能目录下

- 文件：`{技能目录}/output/{项目名称}_安全监测大屏.html`
- 示例：`skills/bw-childsys-dashboard-aqjc/output/山西保安煤业_安全监测大屏.html`
- 链接：`http://192.168.131.50:18700/workspace-subsystem-integration/skills/bw-childsys-dashboard-aqjc/output/{项目名称}_安全监测大屏.html`

---

## 专项规范（仅适用于安全监测系统）

### 零、核心约定（必须遵守）

#### 约定 1：自适应填满视口，无滚动条

整个大屏必须**始终**适配浏览器可视区域，**任何窗口尺寸下均不得出现浏览器滚动条**（弹窗内部滚动除外）。

```css
/* 容器锁定视口高度 */
body, .dashboard {
  height: 100dvh; height: 100vh;  /* dvh 兜底 vh */
  overflow: hidden;
}
/* 弹性区域自动分配高度 */
.chart-row, .chart-grid {
  flex: 1; min-height: 0;
}
/* 内容溢出时内部滚动，不扩散到页面 */
.scroll-area {
  overflow-y: auto; flex: 1; min-height: 0;
}
```

| 规则 | 说明 |
|------|------|
| 容器锁定 | `height: 100dvh; overflow: hidden` — 禁止页面滚动 |
| 弹性撑满 | `flex: 1` — 行/列自动平分剩余高度 |
| 允许收缩 | `min-height: 0` — flex 子项才能正确收缩 |
| 内部滚动 | `overflow-y: auto` — 表格/告警列表内部滚动 |
| 固定区域 | `flex-shrink: 0` — Header/KPI 行固定高度不压缩 |
| 弹窗不扩散 | `position: fixed; overflow-y: auto` — 弹窗自身滚动 |
| 图片/SVG | `max-width: 100%; height: auto` — 不溢出容器 |

**验证方式：** 分别在以下分辨率测试，均无滚动条：
- 1920×1080（全高清）
- 1366×768（笔记本）
- 1280×720（老显示器）
- 375×667（手机纵向）
- 任意 resize 拖拽过程

#### 约定 2：图表悬浮必须有 Tooltip

见 §一-C 通用图表交互约定。

#### 约定 3：数据刷新无感

所有定时刷新（10s 间隔）必须做到：
- 不显示 loading 遮罩（`silent=true`）
- DOM 复用，不重建（`textContent` diff / `innerHTML` diff）
- 不闪烁、不抖动、不中断用户操作
- 趋势图新数据点用 D3 `transition` 平滑滑入

---

### 一、页面布局

```
┌─────────────────────────────────────────────────────────────────────┐
|                                 安全监测                    实时时间|
├──────────────────────────────────────────────┬──────────────────────┤
│ HERO ROW: 监测总数 │ 报警点数 │ 正常运行 │ 安全率 │ 故障设备 │ 需标校 │
├─────────────────────────────────────────────────────────────────────┤
│ 突出预警条（煤与瓦斯突出风险时显示，紫色闪烁）                          │
├──────────────────────────────────────────────┬──────────────────────┤
│ 监测点列表  共N条  [过滤标签×]    [更多→]     │ 实时告警 AlarmTimeline │
├───────────────────────┬──────────────────────┤ L3/L4 计数徽章       │
│ 监测点列表（左半）     │ 监测点列表（右半）     │ + LIVE 脉冲指示器    │
│ 列: 点号/名称/值/时间/状态 │ 列: 点号/名称/值/时间/状态 │ 分级色标          │
│ 行左侧发光条 — 分级着色 │ 行左侧发光条 — 分级着色 │ L1(黄)/L2(红)/      │
│ 正常绿/预警黄/报警红/  │ 正常绿/预警黄/报警红/  │ L3(橙)/L4(紫)        │
│ 紧急橙/突出紫/故障琥珀/│ 紧急橙/突出紫/故障琥珀/│ 内置 [历史→] 按钮    │
│ 离线灰                 │ 离线灰                │ ───────────────────  │
│                       │                      │  分类统计 CategoryBar          │
│                       │                      │  水平柱状图 + 点击筛选        │
│                       │                      ├──────────────────────┤
│                       │                      │ 安全状态分布         │
│                       │                      │ StatusRing           │
│                       │                      │ 环形图 + 中心安全率   │
│    [每页选择] [上一页 1/N 下一页 →] [页数跳转]│ ── 右侧 30% ──       │
├───────────────────────┴──────────────────────┴──────────────────────┤
```

**PC端：** 左侧70%（两个列表并排 + 共享标题和分页）+ 右侧30%（告警/环形图/分类）
- 两个列表共用顶部标题"监测点列表" + 总数 + 过滤标签 + [更多→]按钮
- 分页控件在底部右侧，含每页条数选择（默认50条，可选20/50/100/200）

**手机端：** 单列堆叠，允许滚动

### 一-C、通用图表交互约定

所有图表（D3/SVG/Canvas）必须遵守以下交互规范：

#### Tooltip 约定（强制）

| 规则 | 说明 |
|------|------|
| **必须存在** | 每个图表 hover 时必须显示 tooltip，无例外 |
| **触发方式** | `mouseenter` / `mousemove` 显示，`mouseleave` 隐藏 |
| **定位** | 跟随光标（鼠标右下方 12px），超出视口时自动翻转 |
| **内容结构** | 标题行（灰色标签）+ 分隔线 + 数值行（主值加粗） |
| **消失延迟** | `transition: opacity .15s`，不设延迟避免拖影 |
| **样式** | 深色半透背景 `rgba(15,23,42,0.95)` + 毛玻璃 + 圆角 8px |
| **最大宽度** | `max-width: 260px`，超长文本换行 |
| **z-index** | `1000`，高于所有界面元素 |
| **不干扰事件** | `pointer-events: none`，不挡住下方交互 |

#### 各图表 Tooltip 内容模板

| 图表 | 标题行 | 主数值 | 辅助信息 |
|------|--------|--------|---------|
| 趋势折线图 | 时间 `YYYY-MM-DD HH:mm` | CH₄ 浓度值 + 单位 | 报警线/断电线参考值 |
| 环形图 | — | 状态分类名 + 数量 | 占比百分比 |
| 雷达图 | — | 维度名称 + 评分 | — |
| 柱状图 | — | 类别名 + 数量 | 告警率 |
| 热力图 | 日期 | 告警次数 | — |
| 仪表盘 | — | 安全率 | — |
| 玫瑰图 | — | 风向 + 风速 | 频率百分比 |
| 气泡图 | 区域名 | 传感器类型 | 数量 + 告警率 |

#### 实现示例

```javascript
// 通用 tooltip 函数
function showTooltip(html, event) {
  var el = document.getElementById('tooltip');
  el.innerHTML = html;
  el.classList.add('show');
  var rect = el.getBoundingClientRect();
  var x = event.clientX + 12, y = event.clientY - 12;
  if (x + rect.width > window.innerWidth - 10) x = event.clientX - rect.width - 12;
  if (y < 10) y = event.clientY + 12;
  el.style.left = x + 'px'; el.style.top = y + 'px';
}
function hideTooltip() {
  document.getElementById('tooltip').classList.remove('show');
}
```

#### Tooltip CSS

```css
.d3-tooltip {
  position: fixed; padding: 10px 14px; border-radius: 8px;
  background: rgba(15,23,42,0.95);
  border: 1px solid rgba(59,130,246,0.3);
  color: #e2e8f0; font-size: 12px; line-height: 1.6;
  pointer-events: none; z-index: 1000;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  opacity: 0; transition: opacity .15s;
  max-width: 260px;
}
.d3-tooltip.show { opacity: 1; }
```

#### 检查清单

- [ ] 趋势折线图：hover 十字准星 + tooltip（时间+值+阈值参考）
- [ ] 环形图：hover 扇区放大 + tooltip（标签+数量+占比）
- [ ] 雷达图：hover 数据点 + tooltip（维度+评分）
- [ ] 柱状图：hover 柱体透明度变化 + tooltip（类别+数量+告警率）
- [ ] 热力图：hover 单元格 + tooltip（日期+告警次数）
- [ ] 仪表盘：hover 指针区域 + tooltip（安全率）
- [ ] 玫瑰图：hover 花瓣 + tooltip（风向+风速+频率）
- [ ] 气泡图：hover 气泡 + tooltip（区域+类型+数量+告警率）

### 二、Hero KPI 卡片

**6个关键指标：**

| 指标 | 数据来源 | 图标 | 颜色 |
|------|----------|------|------|
| 监测总数 | kpiData.total | 📊 | 蓝色 |
| 报警点数 | kpiData.alarmPoint | 🚨 | 红色 |
| 正常运行 | kpiData.analog + kpiData.switch - kpiData.alarmPoint | ✅ | 绿色 |
| 安全率 | (total - alarmPoint) / total * 100% | 🛡️ | 绿色/黄色 |
| 故障设备 | 前端统计 state="故障" | ⚠️ | 橙色 |
| 需标校 | kpiData.devicesNeedCalibration | 🔧 | 黄色 |

**卡片样式：**
- 毛玻璃效果 + glow orb
- 4色变体（蓝/绿/红/橙）
- 报警点数卡片含 L1-L4 子徽章
- **紧凑布局**：卡片 padding `5px 12px`，icon `14px`，label `11px`，value `22px`，sub `10px`，行 padding `3px 20px`，整体尽量矮以节省垂直空间

### 二-B、界面动画体系

界面动画分为 5 个层次，按优先级从高到低：

| 层次 | 动画名称 | 触发 | 性能消耗 | 实现技术 |
|------|---------|------|---------|---------|
| ① 环境 | 背景粒子系统 | 持续运行 | 中 | Canvas 2D |
| ② 环境 | 呼吸光效 | 持续运行 | 低 | CSS animation |
| ③ 环境 | 扫描线 | 持续运行 | 低 | CSS pseudo-element |
| ④ 反馈 | 悬浮动效 | hover | 极低 | CSS transition |
| ⑤ 反馈 | 告警脉冲 | 告警状态 | 低 | CSS animation |
| ⑥ 数据 | KPI 数值跳动 | 数据更新 | 低 | CSS transition + timer |
| ⑦ 数据 | 曲线绘制 | 首次加载 | 中 | D3 stroke-dashoffset |
| ⑧ 数据 | 新数据点滑入 | 定时刷新 | 中 | D3 transition |
| ⑨ 数据 | 无感刷新呼吸 | 10s 定时器 | 极低 | CSS animation |
| ⑩ 引导 | 卡片入场序列 | 页面加载 | 低 | CSS animation |

#### ① 背景粒子系统

安全监测大屏使用**深色工业风**背景，粒子系统模拟「矿井中的微尘/瓦斯分子」，增加沉浸感：

```css
/* 粒子容器 — canvas 实现，全屏固定 */
.particle-canvas {
  position: fixed; inset: 0;
  width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 0;
}
```

**粒子参数：**

| 参数 | 值 | 说明 |
|------|-----|------|
| 粒子数量 | 40-60 | 避免过多消耗 GPU |
| 粒子大小 | 1.5-3px | 微小颗粒感 |
| 粒子颜色 | `rgba(59,130,246,0.15)` | 半透蓝色，与环境融合 |
| 移动速度 | 0.2-0.6px/s | 极慢漂移 |
| 移动方向 | 随机 + 微重力下沉 | 模拟粉尘沉降 |
| 连接线 | 距离<120px 时绘制 | 微弱网状结构，增加科技感 |
| 连接线颜色 | `rgba(59,130,246,0.04)` | 几乎不可见的连接 |

**实现要点：**
- 使用 `<canvas>` 而非 DOM 节点，避免大量 div 影响性能
- `requestAnimationFrame` 驱动，浏览器不活跃时自动暂停
- `devicePixelRatio` 适配高清屏
- `visibilitychange` 事件：页面隐藏时停止渲染
- **必须设置 `pointer-events: none`**，不干扰任何交互

```javascript
// 粒子系统核心逻辑（示例）
function initParticles(canvas) {
  var ctx = canvas.getContext('2d');
  var particles = [];
  var COUNT = 50;
  var W, H;

  function resize() {
    W = canvas.width = window.innerWidth * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function Particle() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.r = 1.5 + Math.random() * 1.5;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = 0.05 + Math.random() * 0.15; // 微下沉
    this.alpha = 0.3 + Math.random() * 0.4;
  }

  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.y > window.innerHeight + 10) { this.y = -10; this.x = Math.random() * window.innerWidth; }
    if (this.x < -10) this.x = window.innerWidth + 10;
    if (this.x > window.innerWidth + 10) this.x = -10;
  };

  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59,130,246,' + this.alpha * 0.15 + ')';
    ctx.fill();
  };

  // 初始化粒子
  for (var i = 0; i < COUNT; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(function(p) { p.update(); p.draw(); });
    // 画连接线
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(59,130,246,' + (1 - dist / 120) * 0.04 + ')';
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', resize);
  resize();
}
```

#### ② 呼吸光效

卡片边框和数字区域呈现极缓慢的亮度脉动，模拟「系统在呼吸」的感觉：

```css
/* 呼吸动画 keyframes */
@keyframes breathe {
  0%, 100% { border-color: rgba(255,255,255,0.06); }
  50%      { border-color: rgba(59,130,246,0.15); }
}
@keyframes breathe-glow {
  0%, 100% { opacity: 0.06; }
  50%      { opacity: 0.12; }
}

/* 图表卡片呼吸 */
.chart-card {
  animation: breathe 4s ease-in-out infinite;
}
.chart-card:hover {
  animation: none;  /* 悬浮时暂停呼吸，保持高亮 */
  border-color: rgba(59,130,246,0.25);
}

/* KPI glow orb 呼吸 */
.kpi-card .glow {
  animation: breathe-glow 4s ease-in-out infinite;
}
```

| 参数 | 值 | 说明 |
|------|-----|------|
| 周期 | 4s | 一次完整的亮-暗循环 |
| 缓动 | `ease-in-out` | 平滑过渡 |
| 边框变化 | `0.06` ↔ `0.15` | 透明度微变，不刺眼 |
| 应用范围 | `.chart-card` + `.kpi-card .glow` | 所有卡片区域 |
| 暂停条件 | `:hover` | 用户交互时暂停，避免干扰 |

#### ③ 扫描线

在仪表盘区域叠加极微弱的 CRT 扫描线，增加工业/科技感：

```css
.dashboard::after {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255,255,255,0.015) 2px,
    rgba(255,255,255,0.015) 4px
  );
}
```

- 2px 透明 + 2px 半透白，重复
- 不透明度仅 0.015，肉眼几乎不可见，但增加质感
- `pointer-events: none` 不干扰操作
- **不添加**移动扫描线（避免视觉疲劳和眩晕）

#### ④ 悬浮动效

所有可交互元素提供即时视觉反馈：

```css
/* 卡片悬停 */
.chart-card {
  transition: border-color .3s, box-shadow .3s, transform .2s;
}
.chart-card:hover {
  transform: translateY(-1px);
  border-color: rgba(59,130,246,0.2);
  box-shadow: 0 4px 24px rgba(59,130,246,0.08);
}

/* 按钮悬停 */
.btn-hover {
  transition: background .2s, transform .15s;
  cursor: pointer;
}
.btn-hover:hover { transform: scale(1.05); }
.btn-hover:active { transform: scale(0.97); }

/* 列表行悬停 */
.tr-hover { transition: background .15s; }

/* D3 图表交互 */
.bar-hover, .arc-hover {
  cursor: pointer;
  transition: opacity .2s, transform .2s;
}
.bar-hover:hover { opacity: 0.8; }
.arc-hover:hover { opacity: 0.85; }
```

| 元素 | 悬停反馈 | 持续时间 |
|------|---------|---------|
| 图表卡片 | 微上移 1px + 边框高亮 + 阴影 | 200ms |
| KPI 卡片 | 边框高亮 | 300ms |
| D3 柱体/弧段 | 透明度变化 | 200ms |
| 按钮 | 放大 1.05x / 按下缩小 0.97x | 150ms |
| 列表行 | 背景色变化 | 150ms |

#### ⑤ 告警脉冲体系

已在「分级报警体系」中定义，此处补充 CSS 实现：

```css
/* Lv1 预警 — 慢脉冲 (2s) */
@keyframes pulse-lv1 {
  0%, 100% { box-shadow: 0 0 0 0 rgba(234,179,8,0.4); }
  50%      { box-shadow: 0 0 0 6px rgba(234,179,8,0); }
}

/* Lv2 报警 — 脉冲 (1.2s) */
@keyframes pulse-lv2 {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
  50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
}

/* Lv3 紧急 — 快脉冲 (0.6s) */
@keyframes pulse-lv3 {
  0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.6); }
  50%      { box-shadow: 0 0 0 10px rgba(249,115,22,0); }
}

/* Lv4 突出 — 闪烁 (0.3s) */
@keyframes flash-lv4 {
  0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(168,85,247,0.6); }
  50%      { opacity: 0.4; box-shadow: 0 0 24px rgba(168,85,247,0.2); }
}

/* LIVE 指示器 */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.7); }
  50%      { opacity: 0.6; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
}
```

#### ⑥ KPI 数值跳动

当 10s 定时刷新增量更新时，KPI 数字有微弱的跳动反馈：

```css
@keyframes value-bump {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.08); color: #60a5fa; }
  100% { transform: scale(1); }
}

.kpi-value.bump {
  animation: value-bump 0.4s ease-out;
}
```

**触发逻辑：**
```javascript
function updateKPIValue(el, newValue) {
  if (el.textContent !== String(newValue)) {
    el.textContent = newValue;
    el.classList.remove('bump');
    void el.offsetWidth;  // 触发回流，重启动画
    el.classList.add('bump');
  }
}
```

#### ⑦ 曲线绘制动画（D3）

趋势图首次加载时，曲线从左侧绘制到右侧：

```javascript
// D3 画线动画
var totalLen = path.node().getTotalLength();
path
  .attr('stroke-dasharray', totalLen + ' ' + totalLen)
  .attr('stroke-dashoffset', totalLen)
  .transition().duration(1200).ease(d3.easeQuadOut)
  .attr('stroke-dashoffset', 0);

// 环形图展开
arcs.transition().delay(function(_, i) { return i * 80; })
  .duration(600).ease(d3.easeBackOut)
  .attrTween('d', function(d) {
    var interpolate = d3.interpolate(d.startAngle, d.endAngle);
    return function(t) { return arc(Object.assign({}, d, { endAngle: interpolate(t) })); };
  });
```

| 图表 | 入场动画 | 时长 |
|------|---------|------|
| 折线图 | stroke-dashoffset 左到右绘制 | 1200ms |
| 环形图 | 弧段逆时针展开 | 600ms/段 |
| 柱状图 | 宽度 0 → 目标值 | 500ms/柱 |
| 雷达图 | 轮廓描边 | 1000ms |
| 仪表盘 | 指针从起点旋转 | 1200ms |
| 气泡图 | 半径 0 → 目标值 | 500ms/泡 |

#### ⑧ 无感刷新呼吸

当 10s 定时器刷新数据时，页面右上角有一个极微弱的「脉搏」指示：

```css
@keyframes refresh-pulse {
  0%   { opacity: 1; }
  50%  { opacity: 0.3; }
  100% { opacity: 1; }
}

.refresh-indicator {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  margin-left: 6px;
  transition: opacity .3s;
}
.refresh-indicator.active {
  animation: refresh-pulse 0.6s ease-out;
}
```

#### 动画性能原则

| 原则 | 说明 | 违规示例 |
|------|------|---------|
| **只动 composite** | 仅使用 `transform` 和 `opacity` | `width/height/top/left` 触发 layout |
| **GPU 加速** | `will-change: transform` 预声明 | 无准备的动画卡顿 |
| **避免 JS 动画** | CSS animation/transition 优先 | `setInterval` 驱动的位置变化 |
| **60fps** | 保持 16ms 内完成帧渲染 | 超复杂粒子系统 |
| **尊重 reduced-motion** | `prefers-reduced-motion` 关闭动画 | 未检查用户偏好 |
| **暂停不可见** | `visibilitychange` 暂停 canvas | 后台标签页仍在渲染 |
| **不干扰操作** | `pointer-events: none` | 粒子挡住按钮点击 |

```css
/* 无障碍：用户偏好减少动画时关闭所有动画 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .particle-canvas { display: none !important; }
  .dashboard::after { display: none !important; }
}
```

#### 启动时序

```
页面加载时间线
│
├─ T+0ms:    页面骨架渲染（无动画）
├─ T+50ms:   背景粒子系统启动（canvas）
├─ T+100ms:  卡片入场序列（fadeInUp, 逐卡延迟 50ms）
├─ T+200ms:  呼吸光效启动（bounce 4s）
├─ T+500ms:  KPI 数值渲染（无动画，立即显示）
├─ T+600ms:  趋势图 D3 画线动画（1200ms）
├─ T+700ms:  环形图展开动画（600ms/段）
├─ T+800ms:  柱状图生长动画（500ms/柱）
├─ T+900ms:  雷达图描边动画（1000ms）
├─ T+1000ms: 仪表盘指针动画（1200ms）
├─ T+1500ms: 所有入场动画完成
│
└─ T+10s:    首次无感刷新 + 刷新呼吸指示
```

### 三、分级报警体系

| 级别 | 标签 | 颜色 | 动画 | 触发条件 |
|------|------|------|------|---------|
| Lv0 | 正常 | 绿 `#22c55e` | 无 | 未达报警门限 |
| Lv1 | 预警 | 黄 `#eab308` | 慢脉冲 | ≥报警门限 且 <断电门限 |
| Lv2 | 报警 | 红 `#ef4444` | 脉冲 | ≥断电门限 |
| Lv3 | 紧急 | 橙 `#f97316` | 快脉冲 | 超限且变化率 >10% |
| Lv4 | 突出 | 紫 `#a855f7` | 闪烁 | 多传感器+风流逆转等联合条件 |

**判断逻辑：**
```javascript
function determineAlarmLevel(value, alarmThreshold, cutoffThreshold, changeRate) {
  if (value < alarmThreshold) return 0;
  if (value < cutoffThreshold) return 1;
  if (changeRate > 0.1) return 3;
  return 2;
}
```

### 四、监测点列表 MonitoringPointList

**对标：** AQ6201-2019 §5.5.5.1 列表显示

**双表单布局：**
- 两个列表共用顶部标题栏（"监测点列表" + 总数 + 过滤标签 + [更多→]按钮）
- 数据对半拆分，左右并排显示
- 分页和每页条数选择在底部右侧，两表共享
- 每页条数对应两个表单的总条数，各表单显示一半：
  | 每页总条数 | 表单一 | 表单二 |
  |-----------|--------|--------|
  | 50 (默认) | 25 条 | 25 条 |
  | 20 | 10 条 | 10 条 |
  | 100 | 50 条 | 50 条 |
  | 200 | 100 条 | 100 条 |

**表头布局（共用）：**
- 左侧 SVG 图标 + "监测点列表" + `共 N 条` (N = 总条数) + 可选过滤标签（类别 + ×清除按钮）
- 右侧 [更多→] 按钮

**表格列（可点击表头排序）：**
- 列顺序：`点号 | 名称 | 状态 | 状态值(含单位) | 时间`（注意：状态在状态值前面）
- **点号列背景色** — 根据监测点状态自动设置背景色：
  - 正常（lv0）：绿色 `rgba(34,197,94,0.15)`
  - 分站（devLabel 含 'F'）：蓝色 `rgba(59,130,246,0.15)`
  - 报警（lv1/lv2/lv3/lv4）：红色 `rgba(239,68,68,0.15)`
- **状态列** — 显示等级徽章（正常/预警/报警/紧急/突出/故障/离线），分站行显示蓝色「分站」标签
- **状态值列** — 显示数值+单位，如 `0.04 %CH₄`
- **时间列** — 显示完整年月，格式 `YYYY-MM-DD HH:mm`（`substring(0,16)`）
- **列宽分配** — 点号 15% / 名称 36% / 状态 12% / 状态值 15% / 时间 22%
- **字体大小** — 表格字体 14px（主列表和更多列表弹窗统一）
- **无区域列** — 区域仅用于排序/过滤，不作为独立列显示
- **表头排序** — 点击任意列标题切换升序▲/降序▼，支持点号/名称/状态值(数值)/时间/状态(等级)排序

**表格样式：**
- 使用 `border-collapse:separate` + `border-spacing:0`（避免sticky定位导致列错位）
- 不使用 `table-layout:fixed`，让列宽自适应内容

**状态值显示逻辑：**
- 显示 `categoryStateText + 单位`（如 `"0.04 %CH₄"`）
- 父组件 `fetchAll()` map 阶段调用 `buildStateText(item, unit, dv)` 预计算 `_stateText`
- **智能单位追加**：
  - 若 API 返回的 `categoryStateText` 是纯数值（如 `"0.04"`），自动追加单位变成 `"0.04 %CH₄"`
  - 若已包含单位（如 `"0.04 %CH₄"`），直接返回
  - 若是文本（如 `"正常"`、`"报警"`），直接返回
  - 数值为 0 时也显示单位（如 `"0.00 %CH₄"`）
- **单位自动匹配** — 若 API 未返回 `unit` 字段，通过 `getUnitByCategory(categoryName)` 自动匹配：
  - 瓦斯/甲烷 → `%CH4`
  - 一氧化碳 → `ppm`
  - 风速/风量 → `m/s`
  - 温度 → `℃`
  - 负压/压力 → `kPa`
  - 粉尘 → `mg/m³`
  - 氧气 → `%O2`
  - 二氧化碳 → `%CO2`
  - 硫化氢 → `ppm`
  - 电压 → `V`
  - 电流 → `A`
  - 功率 → `kW`
- 回退链: `stateText/valueText/categoryStateText → 纯数值检测 → "d.toFixed(2) + unit" → 已有文本追加单位 → statusTxt/state → ''`
- `parseNumeric(value)` 从 HTML 富文本中提取数值（NaN 守卫 → 0）
- **确保始终带单位**：即使数值为0也显示单位

**行左侧发光条：**
- 每行 `::before` 伪元素生成 3px 垂直渐变条 + `box-shadow` 发光
- 颜色简化为三种：
  - **分站（devLabel含F）**: 蓝色 `#3b82f6`
  - **正常设备（lv0）**: 绿色 `#22c55e`
  - **报警（lv1~lv4）**: 红色 `#ef4444`（所有报警等级统一红色）
  - 故障: 琥珀 `#f59e0b`
  - 离线: 灰 `#64748b`
- **状态列**：分站行显示蓝色「分站」标签（替代等级徽章）

**表格字体颜色：**
- 所有表格单元格文字统一白色 `#fff`

**分站特殊处理：**
- 判断条件：`devLabel` 包含字母 `F`
- 状态列不显示 Lv0~Lv4 等级徽章，改为蓝色背景 `rgba(59,130,246,0.15)` + 蓝色文字 `#3b82f6` 的「分站」标签
- 主列表和更多列表弹窗中均需统一处理

**状态值含单位：**
- `displayStateText(item)` 逻辑：读取 `categoryStateText`，若为数值则附加 `unit`（如 `"0.04 %CH4"`），否则直接渲染文本

**交互：**
- **指定数量拉取 + 服务端分页** — 每次请求指定条数（默认50条，即每表单25条），翻页时调用API获取对应页数据
- 前端将返回数据**对半拆分**：`前半 → 表单一`，`后半 → 表单二`
- StartRow = (当前页 - 1) * 每页条数 + 1
- PageRowNums = 用户选择的每页条数（可选：20/50/100/200），对应两表总和，默认50
- **总数来源** — "共N条"和分页"第X页/共Y页"使用策略8453（KPI）返回的 `total` 字段，而非策略1954当前页数据长度。KPI返回数组，取 `[0].total`
- 客户端过滤：按类别快速标签过滤
- 客户端排序：两个列表同步排序
- **点击点号列** → 打开**居中弹窗** SafetyMonitoringDetail（调策略1965），弹窗宽度80%，最大900px
- **点击名称列** → 先更新主趋势图，再打开**居中弹窗** TrendModal 显示该设备3小时趋势图
- **点击行其他区域** → 无操作（由具体列决定）

- **更多 > 全屏弹窗** — 包含筛选栏 + 完整列表（含区域列）+ 分页，独立数据加载

### 五、安全状态分布 StatusRing

**对标：** AQ6201-2019 §5.5.5.4 状态图

**数据一致性：**
- **无筛选时**：使用 KPI 数据（`S.kpi`），确保与 Hero 卡片数值一致
- **有筛选时**：使用筛选后的 `S.items` 数据
- 安全率 = 正常数 / 总数 × 100%

**环形图样式：**
- 垂直布局：环形图在上，图例在下
- 环形图居中，尺寸 120px
- 图例横向换行排列
- 背景圆环 + 多段圆弧（无 `stroke-linecap` 避免间隙）
- 单一数据时用完整圆，多段时限制最大角度避免重叠

**状态分类：**
- 正常（Lv0） / L1预警 / L2报警 / L3紧急 / L4突出 / 故障 / 离线
- 点击切片可筛选对应级别

### 六、分类统计 CategoryBar

**对标：** AQ6201-2019 §5.5.5.4 柱状图

**功能：**
- 按类别（瓦斯/CO/风速/温度等）水平柱状图
- 点击柱体可筛选该类别
- 数据来源：策略1942

**筛选机制：**
- 点击柱状图时，重新请求策略1954获取该类别数据
- CategoryName参数使用点击的类别名
- 更新监测点列表显示该类别所有设备
- "共N条"和分页数据相应更新为该类别总数
- 再次点击同一类别可取消筛选

**数据一致性：**
- 柱状图数值来自策略1942（分类统计）
- 筛选后总数来自策略1954返回的实际数据量
- 确保筛选前后数据一致性

### 六-B、历史趋势曲线 TrendChart

**对标：** AQ6201-2019 §5.6.9 曲线颜色标准

**数据来源：** 策略8455

#### 布局位置

位于 KPI Hero 行下方、监测点列表上方的全宽行，突出预警条下方：

```
┌─────────────────────────────────────────────────────────────────────┐
│ HERO ROW (KPI 卡片)                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 突出预警条                                                            │
├─────────────────────────────────────────────────────────────────────┤
│ 📈 历史趋势曲线（策略8455）— D3.js 折线图（全宽）                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │  标题: 传感器名称  ──  [上一设备 ◀]  [▼ 设备切换]  [▶ 下一设备]  │ │
│ │  时间范围: 当前时间-3h ~ 当前时间  [预设: 1h/3h/8h/24h]         │ │
│ │                                                                 │ │
│ │  ┌─ 折线图区域 ───────────────────────────────────────────────┐ │ │
│ │  │  阈值线: 报警浓度(黄虚) / 断电浓度(红虚) / 复电浓度(蓝虚)  │ │ │
│ │  │  模拟量: 连续折线 + 面积填充                               │ │ │
│ │  │  开关量: 阶梯线(0/1) + 状态色块                            │ │ │
│ │  │  hover: 十字准星 + tooltip 精确值                          │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │  图例: 实时值(蓝实) │ 报警(黄虚) │ 断电(红虚) │ 复电(蓝虚)      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────┬──────────────────────┤
│ 监测点列表 ...                                  │ 实时告警 ...        │
```

#### 时序数据渲染规则

根据 `devType` 区分两种渲染模式：

| 类型 | categoryName 示例 | value 范围 | 渲染方式 | Y轴标注 |
|------|------------------|-----------|---------|---------|
| 模拟量 | 瓦斯/CO/风速/温度/负压/粉尘 | 连续浮点 | D3 平滑折线 + 面积填充 | 数值+单位 |
| 开关量 | 馈电/开停/风门/风机 | 0 或 1 | D3 阶梯线 + 背景色块 | 状态文字 |

**模拟量渲染（默认）：**
- 曲线: `d3.line().curve(d3.curveMonotoneX)` — 保单调平滑曲线
- 面积: `d3.area()` — 从基线到曲线的半透明填充 (rgba 12%)
- 阈值线: 根据 `categoryName` 自动匹配 AQ1029-2019 表1 的报警/断电/复电值
  - 瓦斯: 1.0 / 1.5 / 0.75
  - 其他类别阈值从策略8453/1965返回的 `highAlarm` / `cutoff` / `reconnect` 字段获取
- 数据点: 每6个点标记一个圆点 (减少视觉噪点)

**开关量渲染：**
- 曲线: `d3.line().curve(d3.curveStepAfter)` — 阶梯线，清晰显示状态切换时刻
- 状态色块: 值=1 时背景浅绿色块，值=0 时背景灰色块
- Y轴: 仅显示 0 和 1 两个刻度，右侧标注状态文字（如"有电/断电"）

#### 交互

| 交互 | 行为 |
|------|------|
| 十字准星 hover | 竖线跟随鼠标，高亮最近数据点，显示 tooltip（时间/值/单位） |
| 设备切换 | 下拉选择/前后按钮切换 `point_name`，重新调用策略8455 |
| 时间范围切换 | 预设按钮 1h/3h/8h/24h，更新 `dt_begin`/`dt_end` 重新拉取 |
| 点击阈值线 | (可选) 显示该传感器详细阈值配置弹窗 |

#### 触发机制

趋势图的数据加载由以下 5 种场景触发，按优先级排列：

```
触发场景                  触发条件                         加载行为                     S.currentDevice 变化
──────────────────────────────────────────────────────────────────────────────────────────────────────────
① 首次加载                页面 onMounted                   加载第一个监测点的趋势         设为 monitorItems[0]
                          (fetchAll 完成后)

② 点击名称列             用户点击监测点列表的               加载该设备的趋势              更新为点击的设备
                          名称列单元格                       切换趋势图为主趋势
                          (非点号/非其他列)

③ 设备切换控件            用户操作趋势图自带的               加载目标设备的趋势            更新为选中的设备
                          [◀ 上一设备] / [▶ 下一设备] /
                          [▼ 设备下拉] 控件

④ 定时刷新                每 10 秒自动触发                 重新拉取当前设备数据          不变
                          (setInterval)                    (silent 模式)

⑤ 告警列表点击            (可选) 用户点击告警列表某行        加载告警对应设备的趋势        更新为告警设备
                          (点击后跳转到趋势)
```

#### ① 首次加载流程

```
onMounted
│
├─ ssoLogin()
│
├─ fetchAll() → 获取 monitorItems (1954) + KPI (8453) + 分类 (1942)
│   │
│   └─ fetchAll 完成回调: initDefaultTrend()
│       │
│       ├─ 确定默认设备:
│       │   ├─ 1. 取 monitorItems 中 alarmType=1 的第一条（有报警的设备优先）
│       │   ├─ 2. 否则取 monitorItems[0]（列表第一个设备）
│       │   └─ 3. 若列表为空，取预设的默认 keyname
│       │
│       ├─ S.currentDevice = { keyname, name, devType, categoryName, unit }
│       │
│       ├─ fetchTrend(S.currentDevice.keyname) → 策略 8455
│       │   ├─ dt_begin = getThreeHoursAgo()
│       │   ├─ dt_end = getNow()
│       │   ├─ point_name = S.currentDevice.keyname
│       │   └─ interval_minute = 5
│       │
│       └─ renderTrendChart(points, deviceInfo)
│           ├─ 模拟量 → d3.line().curve(d3.curveMonotoneX) + 面积 + 阈值线
│           └─ 开关量 → d3.line().curve(d3.curveStepAfter) + 0/1 状态块
│
├─ fetchAlarms() → 告警列表 (1960)
│
└─ setInterval(10s) → silent 刷新
    ├─ fetchAll(silent=true)    ← 刷新监测点列表/KPI/分类
    ├─ fetchAlarms(silent=true)  ← 刷新告警
    └─ fetchTrend(silent=true)   ← 刷新当前设备趋势
       └─ 新数据点追加到已有 points 数组尾部，D3 transition 平滑移入
```

#### ② 点击名称列触发

点击监测点列表中的**名称列**时，切换趋势图到该设备（或弹窗展示）：

**方案 A（推荐 — 大屏趋势图切换）：**
```
用户点击 <td class="col-name"> 名称单元格
│
├─ 更新主趋势图设备:
│   ├─ S.currentDevice = {
│   │     keyname: item.name || item.devLabel,     // 传给 8455 的 point_name
│   │     name: item.detectionParam,
│   │     devType: item.devType,
│   │     categoryName: item.categoryName,
│   │     unit: getUnitByCategory(item.categoryName)
│   │   }
│   ├─ 趋势图标题更新: "📈 {item.detectionParam} ({item.categoryName})"
│   ├─ 名称列高亮: 当前选中设备添加 .name-active 类
│   └─ fetchTrend(S.currentDevice.keyname) → 重新渲染趋势图
│       └─ renderTrendChart(points, S.currentDevice)
│
├─ 同时滚动视图使趋势图完整可见
│
└─ 如果点击的是分站行(devLabel含F):
    └─ 提示 "分站无趋势数据" 或显示分站下所有设备的聚合趋势
```

**方案 B（备选 — 独立趋势弹窗）：**
```
用户点击 <td class="col-name"> 名称单元格
│
├─ 打开 TrendModal 历史趋势弹窗
│   ├─ 全屏弹窗（类似 MoreListModal 风格）
│   ├─ 标题: "{item.detectionParam} — 历史趋势"
│   ├─ 内容: D3 折线图（含阈值线/设备切换/时间范围切换）
│   ├─ 默认 3 小时范围，5 分钟间隔
│   └─ 底部 [关闭] 按钮
│
└─ callStrategy(8455, {point_name: item.name})
    → renderTrendChart(points, item)
```

**两种方案的选择依据：**
- 页面已有主趋势图（全宽）→ **方案 A**，点击名称仅切换主图设备
- 页面无主趋势图或需要多设备对比 → **方案 B**，独立弹窗展示

**名称列点击态视觉反馈：**
```css
/* 当前选中的设备名称高亮 */
.col-name {
  cursor: pointer;
  transition: color .2s, text-shadow .2s;
}
.col-name:hover {
  color: #60a5fa;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.col-name.name-active {
  color: #60a5fa;
  text-shadow: 0 0 8px rgba(59,130,246,0.3);
}
.col-name.name-active::after {
  content: '📈';
  margin-left: 4px;
  font-size: 11px;
}
```

#### ③ 设备切换控件

趋势图标题栏右侧的内置控件：

```
┌─────────────────────────────────────────────────────────────┐
│ 📈 地面洗选精煤仓3#煤仓上口甲烷_激光甲烷 (瓦斯)              │
│     [◀ 上一设备]  [▼ 设备下拉]  [▶ 下一设备]    [1h/3h/8h/24h] │
└─────────────────────────────────────────────────────────────┘
```

**控件行为：**

| 控件 | 交互 | 行为 |
|------|------|------|
| ◀ 上一设备 | 单击 | 切换到 `monitorItems` 中上一个设备，循环到头则到尾 |
| ▶ 下一设备 | 单击 | 切换到 `monitorItems` 中下一个设备，循环到尾则到头 |
| ▼ 设备下拉 | 单击展开 | 展示 `monitorItems` 所有设备列表（格式: `detectionParam | categoryName | 当前值`），点击即切换 |
| 1h/3h/8h/24h | 单击 | 切换时间范围，自动重新加载数据 |

**设备列表过滤规则（下拉选项来源）：**
- 下拉选项来自 `S.monitorItems`（当前页的监测点列表数据）
- 默认只显示 **模拟量** 设备（开关量在趋势图中信息量有限，作为可选显示）
- 可通过下拉底部「显示开关量」切换开关展开所有设备

**切换动画：**
- 设备切换时，原曲线以 300ms 淡出，新曲线以 500ms 从右向左划入
- 保持 Y 轴域稳定（除非新设备量纲差异大），避免刻度抖动

#### ④ 定时刷新

```
每 10 秒: setInterval
│
├─ fetchTrend(silent=true, S.currentDevice.keyname)
│   │
│   ├─ 不变的参数: dt_begin, dt_end, interval_minute=5
│   │              （dt_begin 保持为3小时前的滑动窗口）
│   │
│   ├─ 返回最新 37 个点（3h / 5min）
│   │
│   └─ 前端 diff 更新:
│       ├─ 比较新数据最后一个点的时间戳
│       ├─ 如果有新点 → append 到 points 尾部
│       ├─ points.length > 90 → shift() 移除最旧点
│       └─ 复用 D3 path 的 .transition() 更新，不重建 SVG
│
├─ fetchAll(silent=true)
└─ fetchAlarms(silent=true)
```

**特殊情况：**
- 用户正在拖动 hover 十字准星时，静默刷新**不中断**用户交互
- D3 的 `transition` 仅更新 `d` 属性，不重建 DOM
- 如果当前设备在 monitorItems 中已不存在（如翻页后），自动切换到新列表的第一个设备

#### ⑤ 告警列表触发（可选增强）

在实时告警列表中，点击某条告警可跳转到趋势图：

```
告警列表点击某行
│
├─ 如果该告警有 devLabel：
│   ├─ S.currentDevice = 从 monitorItems 匹配 devLabel
│   ├─ 如果匹配不到，用告警的 devLabel 直接作为 point_name 调用 8455
│   └─ 趋势图标题显示: "告警设备: {报警设备名}"
│
└─ 窗口滚动到趋势图位置 (scrollIntoView)
```

#### 状态管理

```javascript
// 趋势图全局状态
var S = {
  // ... 其他状态 ...
  trend: {
    isDemo: !window.location.hostname || window.location.hostname === 'localhost',
    currentDevice: null,     // { keyname, name, devType, categoryName, unit }
    points: [],              // [{ time: Date, value: number, keyname: string }]
    timeRange: 3,            // 小时: 1 | 3 | 8 | 24
    intervalMin: 5,          // 数据间隔分钟
    isLoading: false,
    lastLoadTime: null,
    deviceList: [],          // 可供选择的设备列表（来自 monitorItems）
    deviceIndex: 0           // 当前设备在 deviceList 中的索引
  }
};

// 切换设备
function switchToDevice(deviceOrIndex) {
  var dev = typeof deviceOrIndex === 'number'
    ? S.trend.deviceList[deviceOrIndex]
    : deviceOrIndex;
  if (!dev) return;
  S.trend.currentDevice = {
    keyname: dev.name || dev.devLabel,
    name: dev.detectionParam || dev.devLabel,
    devType: dev.devType,
    categoryName: dev.categoryName,
    unit: getUnitByCategory(dev.categoryName)
  };
  S.trend.deviceIndex = S.trend.deviceList.indexOf(dev);
  loadTrendData(S.trend.currentDevice.keyname);
}

// 上一设备 / 下一设备
function prevDevice() {
  var total = S.trend.deviceList.length;
  if (!total) return;
  var idx = (S.trend.deviceIndex - 1 + total) % total;
  switchToDevice(idx);
}
function nextDevice() {
  var total = S.trend.deviceList.length;
  if (!total) return;
  var idx = (S.trend.deviceIndex + 1) % total;
  switchToDevice(idx);
}
```

#### 无感刷新

- 每10秒自动拉取最新数据（`dt_begin` 保持为3小时前，`dt_end` 为当前时间）
- 复用 D3 的 `transition` 实现新数据点平滑接入，避免整图闪烁
- 数据点超出 90 个时自动 shift 旧点

#### 开发/演示模式 — 使用假数据

当后端不可用时，调用 `getMockTrendData()` 可获取模拟的 8455 格式数据（在「生成流程/第一步」中已定义该函数）。

**用法示例（D3 趋势图初始化）：**

```javascript
// 尝试调用真实 API，失败时回退到假数据
function loadTrendData(point_name, dt_begin, dt_end) {
  // 开发模式开关：true=使用假数据，false=使用真实API
  var isDemo = !window.location.hostname || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isDemo) {
    // 直接使用假数据
    var mockData = getMockTrendData(point_name || '');
    return Promise.resolve(mockData);
  }

  // 生产模式：调用真实API
  return callStrategy(8455, [
    { name: "MineName", value: getMineName() },
    { name: "dt_begin", value: dt_begin || getThreeHoursAgo() },
    { name: "dt_end", value: dt_end || getNow() },
    { name: "point_name", value: point_name || '' },
    { name: "interval_minute", value: 5 }
  ]).catch(function(err) {
    console.warn('8455 API 调用失败，使用假数据:', err);
    return getMockTrendData(point_name || '');
  });
}

// 解析趋势数据（兼容真假数据）
function parseTrendData(raw, categoryName) {
  var arr = Array.isArray(raw) ? raw : [];
  var points = arr.map(function(p) {
    return {
      time: new Date(p.dt.substring(0, 19).replace(/-/g, '/')),
      value: +p.value,
      keyname: p.keyname
    };
  });
  points.sort(function(a, b) { return a.time - b.time; });
  return {
    points: points,
    unit: getUnitByCategory(categoryName),
    isSwitch: points.every(function(p) { return p.value === 0 || p.value === 1; })
  };
}
```

**假数据包含的设备类型：**

| keyname | 名称 | devType | category | 特点 |
|---------|------|---------|----------|------|
| SXBAMY0030120001A03 | 地面洗选精煤仓3#煤仓上口甲烷 | 模拟量 | 瓦斯 | base=0.6, 有超限片段(1.18) |
| SXBAMY0030120007B01 | 102#掘进面回风_CO | 模拟量 | 一氧化碳 | base=12, 变化幅度大 |
| SXBAMY0030120005C03 | 主斜井_风速 | 模拟量 | 风速 | base=4.5, 稳定 |
| SXBAMY0030120008D01 | 机电硐室_温度 | 模拟量 | 温度 | base=26, 缓慢波动 |
| SXBAMY0030120007D02 | 102#掘进面_馈电 | 开关量 | 馈电 | 1=有电 / 0=断电 |
| SXBAMY0030120007D03 | 102#掘进面_开停 | 开关量 | 开停 | 1=开 / 0=停 |

**假数据行为特征：**
- 时间范围：当前时间前 3 小时，5 分钟间隔（37 个点/设备）
- 模拟量：正弦波 + 随机噪声，某些设备包含超限片段（测试红线）
- 开关量：大部分时间 = 1，特定时段跳变为 0（模拟停机/断电）
- `point_name` 参数支持传入 `keyname` 或设备名模糊匹配，空字符串返回全部设备

### 七、实时告警 AlarmTimeline

**对标：** AQ6201-2019 §5.6.7.2 实时显示

**整体红色主题：**
- 卡片边框：红色呼吸动画 `breathe-red`，边框色 `rgba(239,68,68,0.25)`
- 标题文字：红色 `#f87171`
- LIVE 指示器：红色脉冲 `pulse-dot-red`
- 列表项分隔线：红色 `rgba(239,68,68,0.08)`
- 设备名称：红色 `#fca5a5`
- 时间文字：红色 `rgba(248,113,113,0.6)`
- NEW 标签：红色背景

**功能特性：**
- **L3/L4 计数徽章** — 面板顶部显示 L3、L4 级别告警数量
- **LIVE 脉冲指示器** — 红色实时状态指示
- **NEW 标记** — 5分钟内新告警
- **分级色标** — L1黄/L2红/L3橙/L4紫（仅圆点颜色区分）
- **内置 [历史→] 按钮** — 点击打开历史报警查询弹窗
- 数据来源：策略1960（实时）/ 策略1963（历史）
- **卡片高度**：flex 值为 1，与分类统计、安全状态分布模块等高

**历史报警弹窗（策略1963）：**
- 筛选栏：地点（模糊匹配）、类型（下拉，来自策略1940）、时间范围（日期时间选择器）
- 默认3天日期范围
- 分页显示
- 默认3天日期范围
- 分页显示

### 八、突出预警条 OutburstWarning

**对标：** AQ6201-2019 §5.5.2.3/2.4 突出

- 多传感器瓦斯超限 + 风流逆转 + 瓦斯涌出异常
- 触发 Lv4 紫色闪烁

### 九、详情弹窗 SafetyMonitoringDetail

**对标：** AQ6201-2019 §5.5.5.1 列表显示

**触发方式：** 点击监测点列表的 **点号列**（`<td class="col-index">`）

**弹窗样式：** 居中弹窗（非全屏），宽度 80%，最大 900px，最大高度 85vh
- 增强型 Hero 区：大字数值+单位+报警等级徽章
- 区分为分站详情/监测点详情路径
- 含阈值状态/测点信息/标校维护/设备状态/开关量属性/模拟量属性/时间属性等分区
- 可跳转历史曲线（iframe）

### 九-B、历史趋势弹窗 TrendModal

**触发方式：** 点击监测点列表的 **名称列**（`<td class="col-name">`）

点击名称列时，先更新主趋势图设备，再打开此弹窗展示完整 D3 趋势图。

**弹窗样式：** 居中弹窗（非全屏），宽度 80%，最大 900px，最大高度 85vh

**弹窗内容：**
- 标题：设备名 + 历史趋势
- D3 折线图（高度 400px），含阈值线、面积填充、十字准星 tooltip
- 模拟量: 平滑曲线 + 面积 + 阈值线(黄虚/红虚/蓝虚)
- 开关量: 阶梯线 + 0/1 状态色块

**时间范围筛选：**
- 在弹窗标题栏添加开始时间和结束时间选择器
- 添加“查询”按钮用于按时间范围筛选数据
- 默认显示最近3小时数据
- 选择时间范围后，趋势图自动按新范围重新渲染

**布局：**
```
┌──────────────────────────────────────────────────────────────┐
│  ✕ 关闭  [开始时间] ~ [结束时间] [查询]  {设备名} — 历史趋势  │
├──────────────────────────────────────────────────────────────┤
│  [◀ 上一设备]  [▼ 设备下拉]  [▶ 下一设备]  [1h/3h/8h/24h]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌────────── D3 折线图 ─────────────────────────────────┐   │
│   │  模拟量: 平滑曲线 + 面积 + 阈值线(黄虚/红虚/蓝虚)    │   │
│   │  开关量: 阶梯线 + 0/1 状态色块                       │   │
│   │  hover: 十字准星 + tooltip                           │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│  图例: 实时值(蓝实) │ 报警(黄虚) │ 断电(红虚) │ 复电(蓝虚)    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  数据时间: {dt_begin} ~ {dt_end}  │  间隔: 5min  │  共 N 点  │
└──────────────────────────────────────────────────────────────┘
```

**弹窗规格：**
| 属性 | 值 |
|------|-----|
| 触发 | 点击名称列 |
| 尺寸 | 全屏（`position: fixed; inset: 0; z-index: 500`） |
| 背景 | `rgba(8,12,24,0.92)` 半透明遮罩 |
| 行为 | 内部滚动，背景不滚动 |
| 设备切换 | 与主趋势图共享 `S.trend` 状态，切换回主图时同步 |
| 关闭 | 点击 ✕ / 点击遮罩 / ESC 键 |

### 十、更多列表弹窗 MoreListModal

**功能：** 点击"更多 >"按钮打开全屏弹窗，显示完整监测点列表

**标题：** 监测点列表（去掉"(全部)"字样）

**筛选栏：**
- 分站下拉（策略1938）：全部分站/具体分站
- 类型下拉（策略1940）：全部类型/模拟量/开关量
- 类别下拉（策略1947）：全部类别/具体类别
  - API返回空时，从现有数据中提取类别
  - 默认值为"0"（对应"全部类别"）
- 区域输入框：模糊匹配
- 地点输入框：模糊匹配
- 报警状态：全部状态/报警/正常
- 查询/重置按钮

**布局：**
- 顶部筛选栏：分站/设备类型/类别（下拉）+ 区域/地点（输入框）+ 报警状态（下拉）+ 查询/重置按钮
- 中间列表：包含区域列（与主列表不同）
- 底部分页：支持切换每页条数（20/50/100/200/500）

**数据加载：**
- 独立调用策略1954，参数来自弹窗内的筛选条件
- CategoryName参数默认值为"0"
- 筛选时获取符合条件的总数用于分页
- 类别选项从主列表数据中提取（策略1947可能返回空）
- 区域使用输入框而非下拉

**数据绑定：**
- 分站下拉：调用策略1938，绑定txt-val对
- 类型下拉：调用策略1940，绑定txt-val对（val为数字，前端用txt作为value）
- 类别下拉：调用策略1947，绑定txt-val对；API返回空时从现有数据提取

**分页总数：**
- 无筛选时：使用KPI数据（策略8453）的total字段
- 有筛选时：根据筛选条件获取符合条件的总数

**交互：**
- 表头排序（点击列头切换升序/降序）
- **点击点号列** → 打开详情弹窗 SafetyMonitoringDetail
- **点击名称列** → 打开历史趋势弹窗 TrendModal
- 筛选后自动重置到第一页

---

## 数据流

```
onMounted
│
├─ ssoLogin() → SSO 单点登录
│
├─ fetchAll() ← 显示加载遮罩，并行拉取三路数据
│ ├─ callStrategy(1954, {StartRow, PageRowNums, ...}) → 当前页 monitorItems
│ │   StartRow = (page-1)*pageSize+1，服务端分页
│ │   前端拆分: 前半 → form1Items (0 ~ pageSize/2-1)
│ │             后半 → form2Items (pageSize/2 ~ pageSize-1)
│ ├─ callStrategy(8453, data) → kpi 统计（⚠️ 返回数组，取[0]）
│ └─ callStrategy(1942, data) → 分类统计 (cats, catVals)
│
├─ fetchTrend() ← 独立拉取历史趋势（首次加载 + 定时刷新）
│ └─ callStrategy(8455, {dt_begin, dt_end, point_name, interval_minute})
│     → trendData（扁平数组 [{keyname, dt, value}, ...]）
│     前端处理: parseTrendData(res, categoryName)
│     ├─ 模拟量 → 折线图渲染 (含阈值线: 报警/断电/复电)
│     └─ 开关量 → 阶梯渲染 (0/1 状态)
│
├─ fetchAlarms() ← 独立拉取报警
│ └─ callStrategy(1960, {StartRow:1, PageRowNums:10}) → alarmFeed
│
│ 前端处理 (每次 fetchAll 后):
│ ├─ buildStateText(item, unit, dv) → categoryStateText (展示文本)
│ │ 回退链: categoryStateText → stateText → valueText
│ │ → "dv.toFixed(2) + unit" → statusTxt/state → ''
│ │ 单位自动匹配: getUnitByCategory(categoryName)
│ ├─ parseNumeric(detectionVal) → dv (NaN 守卫 → 0)
│ ├─ getAlarmLevel(item, rawAlarmType) → _alarmLevel (0-4/fault/offline)
│ │ 综合判定: alarmType == 1 || statusTxt === '报警'
│ │ || state === '报警' → determineAlarmLevel()
│ └─ checkOutburstConditions(items) → outburstConditions
│    区域分组 + Lv≥3 多传感器级联 + 风速/风向/风机
│
├─ 隐藏加载遮罩（仅首次/翻页时）
│
└─ setInterval(10s) → 重复 fetchAll(silent=true) + fetchAlarms(silent=true)
    静默刷新：不显示 loading，DOM 复用 + innerHTML diff 无感更新
```

### 翻页流程

```
用户点击页码/切换每页条数/筛选条件变化
│
├─ S.page = 目标页（或重置为1）
├─ showLoading() → 显示加载遮罩
├─ fetchAll(silent=false) → StartRow = (page-1)*pageSize+1
│   服务端返回当前页数据（共 pageSize 条）
│   前端拆分: form1Items = items.slice(0, pageSize/2)
│            form2Items = items.slice(pageSize/2, pageSize)
├─ 全量渲染表单一（前半数据） + 表单二（后半数据） + 分页按钮
└─ hideLoading() → 隐藏加载遮罩

定时刷新流程（silent=true，无感）：
│
├─ fetchAll(silent=true) → 不显示 loading
│   数据 diff：逐行复用 <tr>，textContent 比较后按需更新
│   KPI/分类/环形图：innerHTML diff，内容不变则不写 DOM
├─ fetchAlarms(silent=true) → 告警列表 innerHTML diff
└─ 全程无闪烁、无遮罩、不中断用户操作
```

---

## 曲线颜色规范（AQ6201-2019 §5.6.9）

标准规定曲线显示必须使用特定颜色标注阈值线：

| 阈值 | 线型 | 颜色 | 标准原文 |
|------|------|------|----------|
| 报警浓度 | 黄色虚线 | `#eab308` | "用平行于横轴的**黄色虚线**给出报警浓度" |
| 断电浓度 | 红色虚线 | `#ef4444` | "用平行于横轴的**红色虚线**给出断电浓度" |
| 复电浓度 | 蓝色虚线 | `#3b82f6` | "用平行于横轴的**蓝色虚线**给出复电浓度" |
| 实时监测值 | 实线 | 主题色 | "实时监测值、最大值、平均值、最小值等用不同颜色表示" |

---

## 报警规范（AQ6201-2019 §5.6.12）

| 需求 | 实现 |
|------|------|
| 声音报警 (§5.6.12.1) | ❌ 前端可加 Audio API，当前未实现 |
| 光报警 (§5.6.12.2) | ✅ 红色文字/图符/闪烁（表格+曲线+列表模式均覆盖） |
| **分级报警** (§5.6.12.3) | ✅ Lv0-Lv4 五级，L3快速脉冲，L4闪烁 |
| **逻辑报警** (§5.6.12.4) | ✅ 甲烷+风速关联/多传感器级联/进回风巷联合 |

---

## 甲烷传感器报警/断电/复电浓度表（AQ1029-2019）

规范表1 规定了各位置甲烷传感器的阈值（%CH₄）。前端展示需确保卡片和详情弹窗能显示这三项阈值：

| 位置 | 报警浓度 | 断电浓度 | 复电浓度 | 断电范围 |
|------|---------|---------|---------|----------|
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

## 维护管理关键参数（AQ1029-2019）

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

## 策略API全表

### 核心策略

| 策略ID | 用途 |
|--------|------|
| **1954** | ⭐ 监测点全量列表 |
| **8453** | ⭐ KPI统计（⚠️ 返回数组） |
| **8455** | ⭐ 历史趋势曲线（监测点时序数据） |
| **1942** | ⭐ 分类柱状图 |
| **1960** | ⭐ 实时告警 |
| **1963** | ⭐ 历史报警查询 |

### 辅助策略

| 策略ID | 用途 |
|--------|------|
| 1938 | 分站下拉 |
| 1940 | 类型下拉 |
| 1947 | 类别下拉 |
| 1961 | 区域下拉 |
| 1964 | 地点下拉/分站详情 |
| 1965 | 总数/监测点详情 |

### 请求格式

```javascript
async function callStrategy(strategyId, params) {
  const token = localStorage.getItem('token') 
    || localStorage.getItem('Access-Token')
    || getCookie('token')
    || getCookie('Access-Token');
  
  const response = await fetch('/net/api/poininfoSmartValid/GetStrategyData', {
    method: 'POST',
    headers: {
      'caller': 'openclaw',
      'token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: strategyId,
      parameter: params,
      queryType: 2
    })
  });
  
  const result = await response.json();
  if (result.code === 100) return result.data;
  throw new Error(result.mesg || 'API调用失败');
}
```

### 策略1954返回字段

| 字段 | 类型 | 前端用途 |
|------|------|---------|
| devLabel | string | 唯一ID；含F=分站 |
| detectionParam | string | 列表显示名 |
| devAddress | string | 卡片标题 |
| devArea | string | 区域（仅用于排序/过滤，不显示） |
| devType | string | 类型筛选 |
| categoryName | string | 类别筛选+统计 |
| stationNo | number | 分站归属 |
| alarmType | 0\|1 | 报警判断（默认值0） |
| value | string | 当前值 |
| maxVal | number | 报警门限参考 |
| statusTxt | string | 状态文本 |
| state | string | 传感器状态 |
| calibrationDatetime | string\|null | 标校时间 |
| valueUpdateDT | string | 最后更新时间 |

> `detectionVal` 是HTML富文本（含进度条），前端**不使用**，改用 `value`；`alarmType` 默认值为 `0`，兼容 `0`/`1`（数字）和 `"0态报警"`（字符串）两种格式。

### 策略8453返回字段

**⚠️ 重要：返回的是数组，不是对象！**

```json
[
  {
    "total": 544,
    "analog": 312,
    "switch": 232,
    "substation": 37,
    "other": 0,
    "alarmPoint": 2,
    "devicesNeedCalibration": 0
  }
]
```

**前端处理：**
```javascript
// 策略8453返回数组，取第一个元素
kpiData = Array.isArray(kpiRes) ? (kpiRes[0] || {}) : (kpiRes || {});
```

### 策略1960返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| devLabel | string | 设备ID |
| devAddress | string | 设备地址 |
| devType | string | 设备类型 |
| categoryName | string | 类别 |
| alarmType | string | 报警类型（如"0态报警"） |
| alarmBeginDT | string | 报警开始时间 |
| valueText | string | 当前值文本 |

### 策略1963返回字段（历史报警查询）

| 字段 | 类型 | 说明 |
|------|------|------|
| devLabel | string | 设备ID |
| devAddress | string | 设备地址 |
| devType | string | 设备类型 |
| categoryName | string | 类别 |
| alarmType | string | 报警类型 |
| alarmBeginDT | string | 报警开始时间 |
| alarmEndDT | string | 报警结束时间 |
| valueText | string | 报警值 |

### 策略8455返回字段（历史趋势曲线）

**⚠️ 返回扁平数组，每行一个数据点（非嵌套分组结构）。**

实际返回示例（模拟量，如瓦斯传感器）：
```json
[
  {"keyname":"SXBAMY0030120007D02","dt":"2026-06-25 13:00:00.000","value":0.62},
  {"keyname":"SXBAMY0030120007D02","dt":"2026-06-25 13:05:00.000","value":0.58},
  {"keyname":"SXBAMY0030120007D02","dt":"2026-06-25 13:10:00.000","value":0.71}
]
```

实际返回示例（开关量，如馈电状态）：
```json
[
  {"keyname":"SXBAMY0030120007D03","dt":"2026-06-25 13:00:00.000","value":1},
  {"keyname":"SXBAMY0030120007D03","dt":"2026-06-25 13:05:00.000","value":1},
  {"keyname":"SXBAMY0030120007D03","dt":"2026-06-25 13:10:00.000","value":0}
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| keyname | string | 设备key（对应1954的devLabel） |
| dt | string | 时间戳 `YYYY-MM-DD HH:mm:ss.SSS`（毫秒三位） |
| value | number | 监测值（模拟量=浮点数如0.62；开关量=0或1） |

**关键说明：**
- **模拟量 vs 开关量**：由策略1954返回的 `devType` 决定：
  - `devType="模拟量"` → `categoryName` 如 "瓦斯"（单位 %CH₄）/ "一氧化碳"（单位 ppm）/ "风速"（单位 m/s）/ "温度"（单位 ℃）等 → value 为连续浮点数
  - `devType="开关量"` → `categoryName` 如 "馈电"（1=有电, 0=断电）/ "开停"（1=开, 0=停）/ "风门"（1=开, 0=关）等 → value 为 0 或 1
- `point_name` 参数传入策略1954的 `devLabel` 或 `detectionParam` 均可
- `dt` 字段带毫秒 `.SSS`，前端显示时截取到分钟 `substring(0, 16)`
- `value` 为纯数字，无单位字段，单位需通过 `getUnitByCategory(categoryName)` 获取

**前端处理：**
```javascript
function parseTrendData(res, categoryName) {
  var arr = Array.isArray(res) ? res : [];
  var points = arr.map(function(p) {
    return {
      time: new Date(p.dt.substring(0, 19).replace(/-/g, '/')),
      value: +p.value,
      keyname: p.keyname
    };
  });
  // 按时间排序
  points.sort(function(a, b) { return a.time - b.time; });
  return {
    points: points,
    unit: getUnitByCategory(categoryName),
    // 判断是开关量还是模拟量
    isSwitch: points.every(function(p) { return p.value === 0 || p.value === 1; })
  };
}
```

---

## SSO单点登录

### SDK引入

```html
<script src="/net/Content/Resource/SDK/bw.sso.sdk.js"></script>
```

### 登录流程

SSO 登录成功后，后端 SDK 自动向浏览器写入以下数据：

| 存储位置 | Key | 内容 | 用途 |
|----------|-----|------|------|
| Cookie | `Access-Token` | 鉴权令牌 | 后端鉴权 |
| Cookie | `MineName` | 矿井名称（如"山西保安煤业"） | 所有策略 API 的 `MineName` 参数 |
| Cookie | `MineDesc` | 矿井编码 | 辅助信息 |
| localStorage | `token` | 鉴权令牌（同步） | 前端状态判断 |
| localStorage | `pro__MineName` | 矿井名称（命名空间兜底） | Cookie 读取失败时的后备 |

**前端读取 MineName：**

```javascript
function getCookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// 从 cookie 读取矿井名称，缓存到内存（页面生命周期内有效）
function getMineName() {
  if (getMineName._cached) return getMineName._cached;
  var name = getCookie('MineName');
  if (!name) name = localStorage.getItem('pro__MineName') || '';
  getMineName._cached = name;
  return name;
}
```

```javascript
async function ssoLogin() {
  return new Promise((resolve) => {
    var token = localStorage.getItem('token') 
      || localStorage.getItem('Access-Token')
      || getCookie('token')
      || getCookie('Access-Token');
    if (token) { resolve(true); return; }
    if (typeof BW_SSO_SDK !== 'undefined' && BW_SSO_SDK.SSOLogin) {
      BW_SSO_SDK.SSOLogin(window.location.hostname, window.location.port, (data) => {
        if (!data) { resolve(false); return; }
        // SSO 成功后，后端自动写入 cookie（含 MineName、Access-Token）
        setTimeout(() => {
          var newToken = localStorage.getItem('token') 
            || localStorage.getItem('Access-Token')
            || getCookie('token')
            || getCookie('Access-Token');
          resolve(!!newToken);
        }, 500);
      });
    } else { resolve(false); }
  });
}
```

### 请求头

每次请求自动附加：
```javascript
headers: {
  'caller': 'openclaw',
  'token': getToken()  // 从 localStorage 读取
}
```

---

## 数据刷新

| 模块 | 频率 | 说明 |
|------|------|------|
| 监测点列表 | 10秒 | 服务端分页，每次加载当前页数据 |
| KPI统计 | 随监测点 | 联动更新 |
| 分类统计 | 随监测点 | 联动更新 |
| 实时告警 | 10秒 | 检测新告警 |
| 历史趋势 | 首次加载 + 10秒 | 策略8455，默认3小时窗口 |
| 历史报警 | 按需 | 点击[历史→]时加载 |

### 无感刷新机制

定时刷新必须做到**无感**（不闪烁、不中断用户操作）：

- **静默请求**：后台定时刷新传 `silent=true`，不显示 loading 遮罩
- **DOM 复用**：表格行逐单元格 diff 更新（`textContent` 比较后按需赋值），不整表重建
- **innerHTML diff**：KPI卡片、分类柱状图、环形图、告警列表等模块，先比较 `innerHTML` 是否变化，仅在有差异时才写入
- **空状态防重复**：插入空状态前先检查是否已存在，避免重复 DOM 节点
- **表格行复用规则**：遍历数据时复用已有 `<tr>` 元素，仅更新内容；数据减少时移除多余行；数据增加时追加新行

---

## 检查清单

**通用规范：**
- [ ] 未显示项目名称
- [ ] 支持手机端
- [ ] 底边预留空间
- [ ] 统一颜色主题
- [ ] 空状态友好提示

**专项规范：**
- [ ] 6个Hero KPI卡片完整
- [ ] 分级报警L0-L4体系正确
- [ ] 监测点列表分两个表单(各35%宽)，数据对半拆分(20→10+10, 50→25+25...)，发光条可交互
- [ ] 监测点列表无区域列，列: 点号/名称/状态值(含单位)/时间/状态
- [ ] 安全状态环形图显示
- [ ] 分类统计柱状图可筛选
- [ ] 实时告警时间线有LIVE指示+L3/L4计数徽章
- [ ] 加载遮罩层动画（首次加载/翻页时显示，定时刷新时隐藏）
- [ ] 分站行(devLabel含F)状态列显示蓝色「分站」标签
- [ ] 定时刷新无感（DOM复用+innerHTML diff，不闪烁）
- [ ] 实时告警内置[历史→]按钮打开历史弹窗(策略1963)
- [ ] 突出预警条条件正确
- [ ] 详情弹窗完整（增强型Hero区+分区展示）
- [ ] 策略API调用正确（8453返回数组）
- [ ] **历史趋势曲线（策略8455）** 接口集成
  - [ ] 返回扁平数组 `[{keyname, dt, value}]` 处理正确
  - [ ] 模拟量折线图（平滑曲线 + 面积填充 + 阈值线）
  - [ ] 开关量阶梯图（阶梯线 + 0/1 状态色块）
  - [ ] 每10秒无感刷新，数据平滑过渡
  - [ ] 设备切换（下拉 + 前后按钮）
  - [ ] 时间范围切换（1h/3h/8h/24h 预设按钮）

---
