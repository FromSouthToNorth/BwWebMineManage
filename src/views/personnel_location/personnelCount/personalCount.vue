<template>
  <div class="container personnel-page">
    <headerCom :title="'人员出勤统计'" :btns="btns" @countType="countType" :index="active" />
    <div class="query-bar">
      <baseQueryBarVue @search="search" :title="forItemList.title" :formItemList="forItemList.data" :key="active" :reSet="true" />
    </div>
    <div v-if="active == 0" class="personalCount">
      <myTable :tableData="tableData" :tableColumnOptions="tableColumn" :selectionShow="false" :loading="loading" :paginationShow="true" :tableDataTotal="total" @columnClick="columnClick" @tableUpdate="tableChange" :hasIndex="false" :maxHeight="maxHeight" :key="active" ref="myTable" />
    </div>
    <div v-if="active == 1" class="classifyCount">
      <myTable :tableData="tableData" :tableColumnOptions="tableColumn" :selectionShow="false" :loading="loading" :paginationShow="true" :tableDataTotal="total" @columnClick="columnClick" @tableUpdate="tableChange" :hasIndex="false" :maxHeight="maxHeight" :key="active" ref="myTable" />
    </div>
    <div v-else-if="active == 2" class="monthCount">
      <echartsHeader :title="`${year}年${month}月 出勤时长统计表`" :unit="'单位/小时'" />
      <div id="chartHeader-bar"></div>
    </div>
    <div v-else-if="active == 3" class="dayCount">
      <myTable :tableData="tableData" :tableColumnOptions="tableColumn" :selectionShow="false" :loading="loading" :paginationShow="true" :tableDataTotal="total" @columnClick="columnClick" @tableUpdate="tableChange" :hasIndex="false" :maxHeight="maxHeight" :key="active" ref="myTable" />
    </div>
    <trajectory :isShow="track" @update:isShow="track = $event" :title="'井下轨迹时长最长的三个地点'" :isQuery="false" :formItemList="[]" :isResetBtn="false" :tableData="trackTabData" :columnOptions="trackColumn" :paginationShow="false" :isShowFooter="false" :hasIndex="true" :width="'80%'" :loading="trackLoding" />
  </div>
</template>

<script>
import trajectory from '@/components/personnelLocation/trajectoryQuery.vue'
import baseQueryBarVue from '@/components/personnelLocation/baseQueryBar.vue'
import headerCom from '@/components/personnelLocation/header.vue'
import myTable from '@/components/personnelLocation/tableComponent.vue'
import echartsHeader from '@/components/personnelLocation/echartsHeader.vue'
import { getpersonalData, getMonthCountData, getSelectData, getClassifyCountData, getDayCountData, GetStrategyData } from '@/api/system/personnelLocation'
import { getinitBarZoom, getYear } from '../downholeInfoJs'

export default {
  name: 'PersonalCount',
  components: { headerCom, baseQueryBarVue, myTable, echartsHeader, trajectory },
  data() {
    return {
      maxHeight: 700, active: 0, loading: false,
      btns: [
        { text: '个人统计', path: '' }, { text: '分类统计', path: '' },
        { text: '月统计', path: '' }, { text: '日统计', path: '' },
      ],
      forItemList: { title: '个人统计列表', data: [
        { type: 'select', placeholder: '选择部门', selectOptions: [], param: 'Department', defaultSelect: '' },
        { type: 'select', placeholder: '选择职位', selectOptions: [], param: 'Rank', defaultSelect: '' },
        { type: 'select', placeholder: '选择工种', selectOptions: [], param: 'WorkType', defaultSelect: '' },
        { type: 'input', placeholder: '输入卡号', param: 'SenderID' },
        { type: 'input', placeholder: '输入姓名', param: 'UserRealName' },
        { type: 'input', placeholder: '输入工号', param: 'WorkNumber' },
      ]},
      tableData: [], tableColumn: [], total: 0, barXData: [], barYData: [],
      months: [
        { name: '一月', value: 1 }, { name: '二月', value: 2 }, { name: '三月', value: 3 },
        { name: '四月', value: 4 }, { name: '五月', value: 5 }, { name: '六月', value: 6 },
        { name: '七月', value: 7 }, { name: '八月', value: 8 }, { name: '九月', value: 9 },
        { name: '十月', value: 10 }, { name: '十一月', value: 11 }, { name: '十二月', value: 12 },
      ],
      years: [], year: '', month: '', day: '',
      departs: [], jobs: [], works: [],
      Page: 1, Row: 20, params: {}, track: false,
      trackColumn: [
        { label: '初次上报时间', prop: 'starttime' }, { label: '末次上报时间', prop: 'endTime' },
        { label: '停留时间', prop: 'runTime' }, { label: '所在区域', prop: 'areaName' },
        { label: '所在位置', prop: 'devicePosition' },
      ],
      trackLoding: false, trackTabData: [],
    }
  },
  mounted() {
    this.updateMaxHeight()
    window.addEventListener('resize', this.updateMaxHeight)
    this.countType(this.active)
    this.getData(this.active)
  },
  beforeDestroy() { window.removeEventListener('resize', this.updateMaxHeight) },
  watch: { active(val) { this.getData(val) } },
  methods: {
    updateMaxHeight() { this.maxHeight = window.innerHeight - 250 },
    countType(index) {
      this.getYears(); this.active = index; this.getSelect()
      switch (index) {
        case 0:
          this.forItemList.title = '个人统计列表'
          this.forItemList.data = [
            { type: 'select', placeholder: '选择部门', selectOptions: this.departs, param: 'Department', defaultSelect: '' },
            { type: 'select', placeholder: '选择职位', selectOptions: this.jobs, param: 'Rank', defaultSelect: '' },
            { type: 'select', placeholder: '选择工种', selectOptions: this.works, param: 'WorkType', defaultSelect: '' },
            { type: 'input', placeholder: '输入卡号', param: 'SenderID' },
            { type: 'input', placeholder: '输入姓名', param: 'UserRealName' },
            { type: 'input', placeholder: '输入工号', param: 'WorkNumber' },
          ]
          this.tableColumn = [
            { label: '#', prop: 'num' }, { label: '姓名', prop: 'UserName', isEvent: true },
            { label: '卡号', prop: 'SenderID' }, { label: '工号', prop: 'WorkNumber' },
            { label: '部门', prop: 'Department' }, { label: '职务', prop: 'Rank' },
            { label: '工种', prop: 'WorkType' },
          ]
          break
        case 1:
          this.forItemList.title = `${this.year}年${this.month}月出勤时长统计`
          this.forItemList.data = [
            { type: 'select', placeholder: '选择年份', selectOptions: this.years, param: 'Year', defaultSelect: this.year },
            { type: 'select', placeholder: '选择月份', selectOptions: this.months, param: 'Month', defaultSelect: this.month },
            { type: 'select', placeholder: '选择部门', selectOptions: this.departs, param: 'Department', defaultSelect: '' },
            { type: 'select', placeholder: '选择职位', selectOptions: this.jobs, param: 'Rank', defaultSelect: '' },
            { type: 'select', placeholder: '选择工种', selectOptions: this.works, param: 'WorkType', defaultSelect: '' },
            { type: 'input', placeholder: '输入工号', param: 'WorkNumber' },
            { type: 'input', placeholder: '输入卡号', param: 'SenderID' },
            { type: 'input', placeholder: '输入姓名', param: 'UserRealName' },
          ]
          this.tableColumn = [
            { label: '#', prop: 'num' }, { label: '工号', prop: 'WorkNumber' },
            { label: '卡号', prop: 'SenderID' }, { label: '姓名', prop: 'UserName', isEvent: true },
            { label: '部门', prop: 'Department' }, { label: '职务', prop: 'Rank' },
            { label: '工种', prop: 'WorkType' }, { label: '出勤次数', prop: 'DownNum' },
            { label: '出勤时长', prop: 'DownWellTime' },
          ]
          break
        case 2:
          this.forItemList.title = '月统计'
          this.forItemList.data = [
            { type: 'select', placeholder: '选择年份', selectOptions: this.years, param: 'Year', defaultSelect: this.year },
            { type: 'select', placeholder: '选择月份', selectOptions: this.months, param: 'Month', defaultSelect: this.month },
            { type: 'select', placeholder: '选择部门', selectOptions: this.departs, param: 'Department', defaultSelect: '' },
            { type: 'select', placeholder: '选择职位', selectOptions: this.jobs, param: 'Rank', defaultSelect: '' },
            { type: 'select', placeholder: '选择工种', selectOptions: this.works, param: 'WorkType', defaultSelect: '' },
            { type: 'input', placeholder: '输入卡号', param: 'SenderID' },
            { type: 'input', placeholder: '输入姓名', param: 'UserRealName' },
            { type: 'input', placeholder: '输入工号', param: 'WorkNumber' },
          ]
          break
        case 3:
          this.forItemList.title = `${this.year}年${this.month}月${this.day}日 出勤时长统计`
          this.forItemList.data = [
            { type: 'date', placeholder: '选择日期', param: 'date', defaultSelect: new Date() },
            { type: 'select', placeholder: '选择部门', selectOptions: this.departs, param: 'Department', defaultSelect: '' },
            { type: 'select', placeholder: '选择职位', selectOptions: this.jobs, param: 'Rank', defaultSelect: '' },
            { type: 'select', placeholder: '选择工种', selectOptions: this.works, param: 'WorkType', defaultSelect: '' },
            { type: 'input', placeholder: '输入工号', param: 'WorkNumber' },
            { type: 'input', placeholder: '输入卡号', param: 'SenderID' },
            { type: 'input', placeholder: '输入姓名', param: 'UserRealName' },
          ]
          this.tableColumn = [
            { label: '#', prop: 'num' }, { label: '工号', prop: 'WorkNumber' },
            { label: '卡号', prop: 'SenderID' }, { label: '姓名', prop: 'UserName', isEvent: true },
            { label: '部门', prop: 'Department' }, { label: '职务', prop: 'Rank' },
            { label: '工种', prop: 'WorkType' }, { label: '班次', prop: 'ShiftId' },
            { label: '下井时间', prop: 'InTime', width: '180' }, { label: '出井时间', prop: 'UpTime', width: '190' },
            { label: '出勤时长', prop: 'DownWellTime' },
            { label: '操作', prop: 'edit', columnType: true, isEvent: true, width: 80,
              slots: [{ soltName: 'track', isEvent: true, isInMore: false, data: '轨迹' }] },
          ]
          break
      }
    },
    search(result) {
      this.params = result; this.params.Page = this.Page; this.params.Row = this.Row
      if ('Year' in result) this.year = result.Year
      if ('Month' in result) this.month = result.Month
      if ('date' in result) {
        let str = result.date.split('-')
        this.year = str[0]; this.month = str[1]; this.day = str[2]
      }
      if (this.active == 1) this.forItemList.title = `${this.year}年${this.month}月出勤时长统计`
      else if (this.active == 3) this.forItemList.title = `${this.year}年${this.month}月${this.day}日 出勤时长统计`
      this.getData(this.active, this.params)
      if (this.active != 2) this.$refs.myTable.updateCurrpage()
    },
    async getData(index, param) {
      // 为需要年月参数的 tab 补充默认值
      if (!param) {
        param = {}
      }
      if (index >= 1 && !param.Year) {
        param.Year = this.year
      }
      if (index >= 1 && !param.Month) {
        param.Month = this.month
      }
      if (index === 3 && !param.date) {
        param.date = `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`
      }
      switch (index) {
        case 0:
          this.loading = true
          const { data: d0 } = await getpersonalData(5299, param)
          this.tableData = d0[0]?.data || []; this.total = d0[0]?.total || 0
          this.loading = false; break
        case 1:
          this.loading = true
          const { data: d1 } = await getClassifyCountData(5300, param)
          if (d1[0]?.data != null && d1.length != 0) { this.tableData = d1[0].data; this.total = d1[0].total }
          else { this.tableData = []; this.total = 0 }
          this.loading = false; break
        case 2:
          const { data: d2 } = await getMonthCountData(5302, param)
          this.barXData = []; this.barYData = []
          if (d2 != null) { d2.forEach((item) => { this.barXData.push(item.userName); this.barYData.push(item.downTimeHour) }); getinitBarZoom(this, document.getElementById('chartHeader-bar'), '小时') }
          break
        case 3:
          this.loading = true
          const { data: d3 } = await getDayCountData(5301, param)
          if (d3[0]?.data != null && d3.length != 0) { this.tableData = d3[0].data; this.total = d3[0].total }
          else { this.tableData = []; this.total = 0 }
          this.loading = false; break
      }
    },
    async getSelect() {
      this.departs = []; this.jobs = []; this.works = []
      const { data: select } = await getSelectData(5308)
      if (select && select[0]) { this.departs = select[0]['Department'] || []; this.jobs = select[0]['Rank'] || []; this.works = select[0]['WorkType'] || [] }
    },
    async getpolicy5652(param) {
      let params = [{ name: 'SenderID', value: param.SenderID }, { name: 'Day', value: param.Day }]
      this.trackLoding = true
      const { data } = await GetStrategyData(5652, params)
      this.trackTabData = data.length != 0 ? data : []
      this.trackLoding = false
    },
    columnClick(result, text) {
      if (text != '轨迹') {
        this.$router.push({ path: '/userinfo', query: { Username: result.UserName, workNum: result.WorkNumber, SenderID: result.SenderID } })
      } else {
        let param = { SenderID: result.SenderID, Day: result.InTime?.substring(0, 10) || '' }
        this.getpolicy5652(param); this.track = true
      }
    },
    getYears() { const d = getYear(); this.years = d.years; this.year = d.year; this.month = d.month; this.day = d.day },
    tableChange(result) { this.params.Page = result.currentPage; this.params.Row = result.pageSize; this.getData(this.active, this.params) },
  },
}
</script>

<style scoped lang="scss">
.container {
  display: flex; flex: 1; flex-direction: column;
  height: 100%; padding: 30px; padding-bottom: 10px;
  .monthCount { width: 100%; height: 100%;
    #chartHeader-bar { width: 100%; height: 95%; }
  }
}
</style>
