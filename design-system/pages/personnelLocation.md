# 人员定位 — 页面覆盖

> 覆盖自 `design-system/MASTER.md`

## 布局差异

- PC 端: 左侧统计图 + 右侧详情列表的两栏布局
- 移动端: 全屏单列，底部 tab 导航
- 实时人数显示在页面顶部（大号数字 + 状态色）

## 核心指标

- 井下总人数（主数值、显示在 hero 位置）
- 区域分布（饼图）
- 时间段趋势（柱状图/折线图）
- 人员清单（表格）

## 页面清单

| 文件 | 功能 |
|------|------|
| `index.vue` | PC 主页面 |
| `downholeInfo.vue` | 井下详细信息 |
| `downholepersonNum.vue` | 井下人数统计 |
| `echarts.vue` | 图表视图 |
| `app/*_app.vue` | 移动端对应页面 |

## 移动端特化

- 使用 Vant 组件: `NavBar`, `Tabbar`, `PullRefresh`
- 全屏底部 Tab: 实时/历史/设备
- 列表项: 84~96px 高度，左侧头像/图标
- 搜索: 顶部固定搜索栏
