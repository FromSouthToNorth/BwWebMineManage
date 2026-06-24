<template>
  <el-dialog v-model="visible" width="820px" top="5vh" class="glass-dialog" destroy-on-close>
    <template #header>
      <div class="report-dialog-header">
        <div class="report-dialog-header__icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <div class="report-dialog-header__title">日报表预览</div>
          <div class="report-dialog-header__sub">模拟量日(班)报表 · 生成时间 {{ reportDate }}</div>
        </div>
      </div>
    </template>

    <div class="report-body" id="safety-report-print">
      <!-- 表头 -->
      <div class="report-table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th>地点</th>
              <th>名称</th>
              <th>单位</th>
              <th>报警<br/>门限</th>
              <th>断电<br/>门限</th>
              <th>复电<br/>门限</th>
              <th>平均值</th>
              <th>最大值<br/>及时刻</th>
              <th>报警<br/>次数</th>
              <th>累计<br/>报警(h)</th>
              <th>断电<br/>次数</th>
              <th>累计<br/>断电(h)</th>
              <th>馈电异常<br/>次数</th>
              <th>馈电异常<br/>累计(h)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in reportRows" :key="i" :class="{ 'row--alarm': row.isAlarm }">
              <td>{{ row.area || '-' }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.unit || '-' }}</td>
              <td>{{ row.alarmThreshold ?? '-' }}</td>
              <td>{{ row.cutoffThreshold ?? '-' }}</td>
              <td>{{ row.reconnectThreshold ?? '-' }}</td>
              <td class="cell--mono">{{ row.avgValue }}</td>
              <td class="cell--mono">{{ row.maxValue }}</td>
              <td class="cell--mono">{{ row.alarmCount }}</td>
              <td class="cell--mono">{{ row.alarmDuration }}</td>
              <td class="cell--mono">{{ row.cutoffCount }}</td>
              <td class="cell--mono">{{ row.cutoffDuration }}</td>
              <td class="cell--mono">{{ row.feedAbnormalCount }}</td>
              <td class="cell--mono">{{ row.feedAbnormalDuration }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- empty -->
      <div v-if="reportRows.length === 0" class="report-empty">暂无数据</div>
    </div>

    <template #footer>
      <div class="report-footer">
        <el-button size="small" class="btn-default" @click="visible = false">关闭</el-button>
        <el-button type="primary" size="small" class="btn-primary" @click="printReport">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 12H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          打印
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: 'ReportPanel' })

import { ref, computed } from 'vue'
import { formatDateTime } from '@/utils/util'

export interface ReportRow {
  area: string
  name: string
  unit: string
  alarmThreshold: number | null
  cutoffThreshold: number | null
  reconnectThreshold: number | null
  avgValue: string
  maxValue: string
  alarmCount: string
  alarmDuration: string
  cutoffCount: string
  cutoffDuration: string
  feedAbnormalCount: string
  feedAbnormalDuration: string
  isAlarm: boolean
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  items?: any[]
}>(), {
  modelValue: false,
  items: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const reportDate = computed(() => formatDateTime(new Date()))

const reportRows = computed<ReportRow[]>(() => {
  return (props.items || []).map((item: any) => {
    const val = item.detectionValue
    return {
      area: item.devArea || item.area || '-',
      name: item.devName || item.devLabel || '-',
      unit: item.unit || '-',
      alarmThreshold: item.alarmThreshold ?? null,
      cutoffThreshold: item.cutoffThreshold ?? null,
      reconnectThreshold: item.reconnectThreshold ?? null,
      avgValue: val != null ? Number(val).toFixed(2) : '-',
      maxValue: item.maxValue > 0 ? Number(item.maxValue).toFixed(2) : '-',
      alarmCount: item._isAlarm ? '1' : '0',
      alarmDuration: item._isAlarm ? '—' : '0',
      cutoffCount: '0',
      cutoffDuration: '0',
      feedAbnormalCount: item.feedStatus === '异常' ? '1' : '0',
      feedAbnormalDuration: item.feedStatus === '异常' ? '—' : '0',
      isAlarm: item._isAlarm,
    }
  })
})

function printReport() {
  const el = document.getElementById('safety-report-print')
  if (!el) return
  const win = window.open('', '_blank', 'width=1100,height=800')
  if (!win) return
  win.document.write(`
    <html><head><title>安全监控日报表</title>
    <style>
      body { font-family: 'PingFang SC','Microsoft YaHei',sans-serif; font-size:12px; color:#1e293b; padding:24px; }
      table { width:100%; border-collapse:collapse; }
      th { background:#f1f5f9; padding:6px 4px; border:1px solid #cbd5e1; font-size:11px; text-align:center; }
      td { padding:4px; border:1px solid #e2e8f0; text-align:center; font-size:11px; }
      .row--alarm { background: #fef2f2; }
      h2 { margin-bottom:4px; }
      .sub { color:#64748b; font-size:11px; margin-bottom:16px; }
    </style></head>
    <body>
      <h2>煤矿安全监控日报表</h2>
      <div class="sub">生成时间: ${reportDate.value}</div>
      ${el.outerHTML}
    </body></html>
  `)
  win.document.close()
  win.print()
  win.close()
}
</script>

<style scoped>
.report-dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-dialog-header__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.report-dialog-header__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.report-dialog-header__sub {
  font-size: 11px;
  color: var(--text-muted);
}

.report-body {
  max-height: 60vh;
  overflow: auto;
}

.report-table-wrapper {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.report-table th {
  background: rgba(148, 163, 184, 0.06);
  color: var(--text-secondary);
  font-weight: 600;
  padding: 6px 4px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  white-space: nowrap;
}

.report-table td {
  padding: 4px;
  border: 1px solid rgba(148, 163, 184, 0.07);
  color: var(--text-primary);
  white-space: nowrap;
}

.row--alarm {
  background: rgba(239, 68, 68, 0.04);
}

.row--alarm td {
  color: var(--color-danger);
}

.cell--mono {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
}

.report-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--text-muted);
  font-size: 14px;
}

.report-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
