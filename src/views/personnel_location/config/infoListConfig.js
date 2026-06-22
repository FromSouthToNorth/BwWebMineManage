/**
 * personnel_location 页面 infoList 组件配置文件
 * 从 D:\bw\Bw.WebMineManage 原始项目移植
 */

// 表格列配置
export const tableColumns = {
  // 带班领导表格列
  leader: [
    { label: '姓名', prop: 'userName' },
    { label: '工号', prop: 'workNumber' },
    { label: '卡号', prop: 'senderID' },
    { label: '部门', prop: 'department' },
    { label: '职务', prop: 'rank' },
    { label: '工种', prop: 'workType' },
    { label: '所在区域', prop: 'areaName', width: 200 },
    { label: '当前位置', prop: 'devicePosition', width: 200 },
    { label: '距离', prop: 'direction' },
    { label: '下井时间', prop: 'downWellTime', width: 180 },
    { label: '班次', prop: 'shift' },
    {
      label: '操作', prop: 'edit', columnType: true, isEvent: true, width: 250,
      slots: [
        { soltName: 'userinfo', data: '人员', isInMore: false },
        { soltName: 'gj', data: '轨迹', isInMore: false },
        { soltName: 'grcq', data: '个人出勤', isInMore: false },
      ],
    },
  ],
  // 设备报警表格列
  deviceAlarm: [
    { label: '报警类型', prop: 'alarmtype' },
    { label: '设备编号', prop: 'number' },
    { label: '设备名称', prop: 'name' },
    { label: '报警内容', prop: 'remarks' },
    { label: '报警时间', prop: 'alarmTime' },
  ],
  // 人员报警表格列
  personAlarm: [
    { label: '报警类型', prop: 'alarmtype' },
    { label: '姓名', prop: 'userName' },
    { label: '卡号', prop: 'senderID' },
    { label: '部门', prop: 'department' },
    { label: '职务', prop: 'rank' },
    { label: '内容', prop: 'remarks' },
    { label: '报警时间', prop: 'alarmTime', width: 180 },
    { label: '当前位置', prop: 'devicePosition', width: 200 },
    {
      label: '操作', prop: 'edit', columnType: true, isEvent: true, width: 120,
      slots: [
        { soltName: 'userinfo', data: '人员', isInMore: false },
        { soltName: 'gj', data: '轨迹', isInMore: false },
      ],
    },
  ],
  // 设备报警历史表格列
  deviceAlarmHistory: [
    { label: '#', prop: 'num' },
    { label: '报警类型', prop: 'AlarmType' },
    { label: '设备编号', prop: 'number' },
    { label: '设备名称', prop: 'name' },
    { label: '报警内容', prop: 'Remarks' },
    { label: '报警时间', prop: 'StartTime' },
    { label: '报警结束时间', prop: 'EndTime' },
  ],
  // 人员报警历史表格列
  personAlarmHistory: [
    { label: '#', prop: 'num' },
    { label: '报警类型', prop: 'AlarmType', sort: true },
    { label: '工号', prop: 'WorkNumber' },
    { label: '姓名', prop: 'userName', isEvent: true },
    { label: '卡号', prop: 'SenderID', sort: true },
    { label: '报警内容', prop: 'Remarks' },
    { label: '报警时间', prop: 'StartTime', sort: true },
    { label: '结束时间', prop: 'EndTime', sort: true },
  ],
}

// 表单配置
export const formConfigs = {
  // 设备报警历史查询表单
  deviceAlarmHistory: [
    { type: 'datetime', param: 'StartTime', label: '开始时间', defaultSelect: null },
    { type: 'datetime', param: 'EndTime', label: '结束时间', defaultSelect: null },
    { type: 'select', param: 'AlarmType', selectOptions: [], label: '报警类型' },
    { type: 'input', param: 'Remarks', placeholder: '模糊查询', label: '报警内容' },
    { type: 'input', param: 'Name', placeholder: '模糊查询', label: '设备名称' },
  ],
  // 人员报警历史查询表单
  personAlarmHistory: [
    {
      type: 'datetime', param: 'StartTime', label: '开始时间', defaultSelect: null,
      cssVariable: [{ name: 'inputWidth', value: '200px' }],
    },
    {
      type: 'datetime', param: 'EndTime', label: '结束时间', defaultSelect: null,
      cssVariable: [{ name: 'inputWidth', value: '200px' }],
    },
    { type: 'select', param: 'AlarmType', selectOptions: [], label: '报警类型' },
    { type: 'input', param: 'Remarks', placeholder: '模糊查询', label: '报警内容' },
    { type: 'input', param: 'WorkNumber', placeholder: '模糊查询', label: '工号' },
    { type: 'input', param: 'Number', placeholder: '模糊查询', label: '卡号' },
    { type: 'input', param: 'Name', placeholder: '模糊查询', label: '姓名' },
  ],
}

// 初始表格数据配置
export const initialTables = [
  {
    title: '带班领导', data: [],
    props: [
      { label: '姓名', prop: 'userName', isEvent: true },
      { label: '卡号', prop: 'senderID', width: 150 },
      { label: '部门', prop: 'department', width: 150 },
      { label: '职务', prop: 'rank', width: 150 },
    ],
  },
  {
    title: '设备报警', data: [],
    props: [
      { label: '报警类型', prop: 'alarmType', width: 100, color: 'rgba(255, 101, 101, 1)' },
      { label: '设备编号', prop: 'number', width: 150 },
      { label: '设备名称', prop: 'name', width: 180 },
      { label: '报警时间', prop: 'alarmTime', width: 180, color: 'rgba(255, 101, 101, 1)' },
    ],
  },
  {
    title: '人员报警', data: [],
    props: [
      { label: '报警类型', prop: 'alarmType', width: 100, color: 'rgba(255, 101, 101, 1)' },
      { label: '姓名', prop: 'userName', width: 150, isEvent: true },
      { label: '卡号', prop: 'senderID', width: 150 },
      { label: '报警时间', prop: 'alarmTime', width: 180, color: 'rgba(255, 101, 101, 1)' },
    ],
  },
]
