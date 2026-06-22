<template>
  <div class="infoListbox">
    <div class="tabBox" v-for="(item, index) in titles" :key="index">
      <div class="box">
        <div
          class="table"
          @click="item.title != '带班领导' && onTableBoxClick(item.title)"
        >
          <span>{{ item.title == '带班领导' ? `井下${item.title}` : item.title }}</span>
        </div>
        <MyTable
          :key="item.title"
          :maxHeight="200"
          :tableData="item.data"
          :tableColumnOptions="item.props"
          :paginationShow="false"
          :hasIndex="false"
          :selectionShow="false"
          :loading="false"
          :tableName="item.title"
          @rowClick="rowClick"
        />
      </div>
    </div>
    <!-- tab表格弹窗 -->
    <personQuery
      v-if="open"
      :isShow="open"
      @update:isShow="open = $event"
      :title="title"
      :width="'80%'"
      :isQueryBtn="isQueryBtn"
      :isResetBtn="isReset"
      :isQuery="isQuery"
      :tableData="tableData"
      :columnOptions="tableColumn"
      :customBtn="customBtn"
      :formItemList="formItemList"
      :isShowFooter="false"
      :paginationShow="pageShow"
      :total="total"
      :changeSearch="false"
      :appendToBody="false"
      :isClearble="true"
      :modal="true"
      :loading="loading"
      @soltHandel="deviceSoltHandel"
      @search="search"
      @close="close"
      @columnClick="tableClick"
      @tableChange="tabPage"
    />
    <trackInfoPopup ref="trackInfoPopup"></trackInfoPopup>
    <userInfoPopup ref="userInfoPopup"></userInfoPopup>
  </div>
</template>

<script>
import { getIndexData, indexTablePopup, getPolicy5400, getPolicy5401 } from '@/api/system/personnelLocation'
import MyTable from '@/components/personnelLocation/tableComponent.vue'
import personQuery from '@/components/personnelLocation/trajectoryQuery.vue'
import { formatterDate, getCurrDateTime, transitionKeyUp } from './downholeInfoJs'
import userInfoPopup from '@/components/personnelLocation/popups/userInfoPopup.vue'
import trackInfoPopup from '@/components/personnelLocation/popups/trackInfoPopup.vue'
import { tableColumns, formConfigs, initialTables } from './config/infoListConfig'
import { handleApiResponse } from '@/utils/personnelLocationUtils'

export default {
  name: 'PersonnelInfoList',
  components: { MyTable, personQuery, userInfoPopup, trackInfoPopup },
  data() {
    return {
      titles: initialTables,
      deviceNum: 0,
      userNum: 0,
      open: false,
      title: '',
      tableData: [],
      tableColumn: tableColumns.deviceAlarm,
      isQueryBtn: false,
      isQuery: false,
      isReset: false,
      pageShow: false,
      formItemList: [],
      customBtn: [{ soltName: 'query', btnName: '历史报警' }],
      row: {},
      total: 0,
      loading: false,
      searchBarData: {},
      day: formatterDate(new Date().getTime(), 'yyyy-MM-dd'),
    }
  },
  mounted() {
    this.getTableList()
  },
  methods: {
    getTableList() {
      this.titles.forEach((item, index) => {
        getIndexData(5259, item.title).then((res) => {
          handleApiResponse(res,
            (dataList) => {
              if (dataList != null && dataList.length != 0) {
                this.titles[index].data = dataList
              } else {
                this.titles[index].data = []
              }
              if (index == 1) this.deviceNum = this.titles[index].data.length
              if (index == 2) this.userNum = this.titles[index].data.length
            },
            (error) => { console.error('获取表格数据失败:', error) }
          )
        })
      })
    },
    async getPolicy5399_5398_5410(id) {
      this.loading = true
      try {
        const { data } = await indexTablePopup(id)
        this.tableData = data && data.length != 0 ? data : []
      } catch (error) {
        console.error('获取弹窗数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    async getSelectOptions(index, title) {
      let AlarmType = title == '设备报警' ? 'device' : 'person'
      try {
        const { data } = await getPolicy5400(AlarmType)
        this.formItemList[index].selectOptions = []
        if (data.length != 0) this.formItemList[index].selectOptions = data[0].Alarmtype
      } catch (error) {
        console.error('获取下拉选项失败:', error)
      }
    },
    async getPolicy5401(param) {
      this.loading = true
      try {
        const { data } = await getPolicy5401(5401, param)
        this.tableData = []
        if (data.length != 0) {
          this.tableData = data[0].data
          this.total = Number(data[0].total)
        }
      } catch (error) {
        console.error('获取报警数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    rowClick(result, name) {
      this.title = name
      this.tableColumn = []
      switch (name) {
        case '带班领导':
          this.tableColumn = tableColumns.leader
          this.getPolicy5399_5398_5410(5410)
          this.isQuery = false
          this.customBtn = []
          this.open = true
          break
        case '设备报警':
          this.tableColumn = tableColumns.deviceAlarm
          this.formItemList = []
          this.getPolicy5399_5398_5410(5399)
          this.isQuery = true
          this.isQueryBtn = false
          this.open = true
          break
        case '人员报警':
          this.isQuery = true
          this.formItemList = []
          this.isQueryBtn = false
          this.tableColumn = tableColumns.personAlarm
          this.getPolicy5399_5398_5410(5398)
          this.open = true
          break
      }
    },
    deviceSoltHandel() {
      if (this.title == '设备报警') {
        if (this.customBtn[0].btnName == '历史报警') {
          this.isReset = true
          this.formItemList = JSON.parse(JSON.stringify(formConfigs.deviceAlarmHistory))
          this.formItemList.forEach((item) => {
            if (item.param === 'StartTime') item.defaultSelect = formatterDate(getCurrDateTime(), 'yyyy-MM-dd 00:00:00')
            else if (item.param === 'EndTime') item.defaultSelect = formatterDate(getCurrDateTime(), 'yyyy-MM-dd HH:mm:ss')
          })
          this.tableColumn = tableColumns.deviceAlarmHistory
          this.searchBarData.type = '设备报警'
          this.searchBarData.StartTime = this.formItemList.find((item) => item.param == 'StartTime').defaultSelect
          this.searchBarData.EndTime = this.formItemList.find((item) => item.param == 'EndTime').defaultSelect
          this.getPolicy5401(this.searchBarData)
          this.pageShow = true
          this.isQueryBtn = true
          this.customBtn[0].btnName = '返回'
        } else {
          this.isReset = false
          this.formItemList = []
          this.tableColumn = tableColumns.deviceAlarm
          this.tableData = []
          this.isQueryBtn = false
          this.pageShow = false
          this.getPolicy5399_5398_5410(5399)
          this.customBtn[0].btnName = '历史报警'
        }
      } else if (this.title == '人员报警') {
        if (this.customBtn[0].btnName == '历史报警') {
          this.isReset = true
          this.formItemList = JSON.parse(JSON.stringify(formConfigs.personAlarmHistory))
          this.formItemList.forEach((item) => {
            if (item.param === 'StartTime') item.defaultSelect = formatterDate(getCurrDateTime(), 'yyyy-MM-dd 00:00:00')
            else if (item.param === 'EndTime') item.defaultSelect = formatterDate(getCurrDateTime(), 'yyyy-MM-dd HH:mm:ss')
          })
          this.tableColumn = tableColumns.personAlarmHistory
          this.pageShow = true
          this.searchBarData.type = '人员报警'
          this.searchBarData.StartTime = this.formItemList.find((item) => item.param == 'StartTime').defaultSelect
          this.searchBarData.EndTime = this.formItemList.find((item) => item.param == 'EndTime').defaultSelect
          this.getPolicy5401(this.searchBarData)
          this.customBtn[0].btnName = '返回'
          this.isQuery = true
          this.isQueryBtn = true
        } else {
          this.isReset = false
          this.formItemList = []
          this.tableColumn = tableColumns.personAlarm
          this.customBtn[0].btnName = '历史报警'
          this.pageShow = false
          this.getPolicy5399_5398_5410(5398)
          this.isQueryBtn = false
        }
      }
      this.formItemList.forEach((item, index) => {
        if (item.type == 'select' && item.param == 'AlarmType') {
          this.getSelectOptions(index, this.title)
        }
      })
    },
    search(result) {
      result.type = this.title
      this.searchBarData = result
      this.getPolicy5401(this.searchBarData)
    },
    tableClick(result, text, title) {
      this.row = result
      switch (text) {
        case '人员':
          this.$refs.userInfoPopup.show(result)
          break
        case '轨迹':
          let param = transitionKeyUp(result)
          this.$refs.trackInfoPopup.show(param)
          break
        case '个人出勤':
          this.$router.push({
            path: '/userinfo',
            query: { Username: result.userName, workNum: result.workNumber, SenderID: result.senderID },
          })
          this.open = false
          break
        default:
          break
      }
    },
    tabPage(result) {
      this.searchBarData.Page = result.currentPage
      this.searchBarData.Row = result.pageSize
      this.searchBarData.type = this.title
      this.getPolicy5401(this.searchBarData)
    },
    close() {
      this.formItemList = []
      this.customBtn = this.$options.data().customBtn
      this.isQueryBtn = false
      this.pageShow = false
      this.isReset = false
      this.searchBarData = {}
    },
    onTableBoxClick(value) {
      this.rowClick(false, value)
    },
  },
}
</script>

<style scoped lang="scss">
.infoListbox {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin: 10px;
  background-color: transparent;

  div { background-color: transparent; }

  .tabBox {
    flex: 1;
    min-width: 0;
    overflow: hidden;

    .box {
      padding: 10px;
      border: 1px;
      border-radius: 10px;
      background: var(--chart-bgColor);
      overflow: hidden;
    }
    .table {
      margin-bottom: 10px;
      :hover {
        color: var(--chart-btn-activeColor);
        cursor: pointer;
      }
    }
  }
}

.el-table::before {
  bottom: 5;
  left: 0;
  width: 100%;
  height: 0;
}

.tabBox .el-table {
  width: 100% !important;
  background-color: rgb(13 48 62 / 100%);
  :deep(.el-table__cell.gutter) {
    background: rgb(13 48 62 / 100%);
  }
  :deep(table) {
    width: 100% !important;
  }
}

.tabBox :deep(.el-table--enable-row-transition .el-table__body td),
.el-table .cell {
  border: none;
}

:deep(.el-dialog) {
  border: 1px;
  border-radius: 10px;
  background: var(--user-popup-contentBgColor) !important;
}

:deep(.el-dialog__title) {
  color: var(--text-color) !important;
}

:deep(.el-dialog__body) {
  padding: 10px;
}
</style>
