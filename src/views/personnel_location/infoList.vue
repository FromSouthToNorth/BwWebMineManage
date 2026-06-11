<template>
  <el-row :gutter="16">
    <el-col :span="8">
      <el-card shadow="hover">
        <template #header><span>带班领导</span></template>
        <el-table :data="leaders" stripe size="small" max-height="200">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="title" label="职务" />
          <el-table-column prop="phone" label="电话" width="110" />
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="hover">
        <template #header><span>设备报警</span></template>
        <el-table :data="deviceAlarms" stripe size="small" max-height="200">
          <el-table-column prop="deviceName" label="设备" />
          <el-table-column prop="alarmType" label="报警类型" width="100" />
          <el-table-column prop="time" label="时间" width="140" />
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="hover">
        <template #header><span>人员报警</span></template>
        <el-table :data="personAlarms" stripe size="small" max-height="200">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="alarmType" label="类型" width="100" />
          <el-table-column prop="location" label="位置" width="120" />
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
defineOptions({ name: 'InfoList' })

const leaders = [
  { name: '张某某', title: '矿长', phone: '138xxxxxxx' },
  { name: '李某某', title: '总工', phone: '139xxxxxxx' },
]

const deviceAlarms = [
  { deviceName: '瓦斯传感器#1', alarmType: '超限', time: '2026-06-11 14:30' },
  { deviceName: '风速传感器#3', alarmType: '异常', time: '2026-06-11 13:15' },
]

const personAlarms = [
  { name: '王某某', alarmType: '超时', location: 'A区' },
  { name: '赵某某', alarmType: '求救', location: 'B区' },
]
</script>
