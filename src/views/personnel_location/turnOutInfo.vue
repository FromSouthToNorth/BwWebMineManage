<template>
  <div class="turnOutInfo personnel-page">
    <myheader :showQuery="false" :showTab="false" />
    <div class="title">
      <span>{{ params.day }}日 {{ params.name }} {{ params.type }}出勤信息</span>
    </div>
    <div class="table">
      <myTable
        :tableData="tableData"
        :tableColumnOptions="tableCloumn"
        :paginationShow="false"
        :hasIndex="true"
        :selectionShow="false"
        :loading="loading"
        :headerCellStyle="tableHeaderStyle"
        :maxHeight="maxHeight"
        ref="myTable"
        @columnClick="tableClick"
      />
    </div>
    <trackInfoPopup ref="trackInfoPopup"></trackInfoPopup>
    <userInfoPopup ref="userInfoPopup"></userInfoPopup>
  </div>
</template>

<script>
import trackInfoPopup from '@/components/personnelLocation/popups/trackInfoPopup.vue'
import userInfoPopup from '@/components/personnelLocation/popups/userInfoPopup.vue'
import myTable from '@/components/personnelLocation/tableComponent.vue'
import myheader from '@/components/personnelLocation/header.vue'
import { getpolicy5266 } from '@/api/system/personnelLocation'
import { transitionKeyUp } from './downholeInfoJs'

const DATA_THEME = 'data-theme'

export default {
  name: 'TurnOutInfo',
  components: { myheader, myTable, userInfoPopup, trackInfoPopup },
  data() {
    return {
      tableData: [],
      tableCloumn: [],
      params: {},
      loading: false,
      maxHeight: 700,
      row: {},
      tableHeaderStyle: {
        color: localStorage.getItem(DATA_THEME) == 'light'
          ? 'rgba(255, 255, 255, 1)'
          : '#FFCF00',
      },
    }
  },
  mounted() {
    this.updateMaxHeight()
    window.addEventListener('resize', this.updateMaxHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateMaxHeight)
  },
  created() {
    let obj = this.$route.params
    let param = {
      month: `${obj.year}${obj.month < 10 ? '0' + obj.month : obj.month}`,
      day: `${obj.year}-${obj.month < 10 ? '0' + obj.month : obj.month}-${obj.day < 10 ? '0' + obj.day : obj.day}`,
      type: obj.type,
      name: obj.name,
    }
    this.params = param
    this.getdata()
  },
  methods: {
    isMobile() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      )
      return flag
    },
    updateMaxHeight() {
      this.maxHeight = window.innerHeight - 200
    },
    async getdata() {
      this.tableCloumn = [
        { label: '姓名', prop: 'userName' },
        { label: '工号', prop: 'workNumber' },
        { label: '卡号', prop: 'senderID' },
        { label: '部门', prop: 'department' },
        { label: '职务', prop: 'rank' },
        { label: '工种', prop: 'workType' },
        { label: '下井时间', prop: 'downWellTime', width: 180 },
        { label: '上井时间', prop: 'upWellTime', width: 180 },
        { label: '下井时长', prop: '下井时长', color: 'red' },
        { label: '班次', prop: 'shift' },
        {
          label: '操作', prop: 'edit', columnType: true, isEvent: true, width: 200,
          slots: [
            { soltName: 'userinfo', data: '人员', isInMore: false },
            { soltName: 'gj', data: '轨迹', isInMore: false },
            { soltName: 'grcq', data: '个人出勤', isInMore: false },
          ],
        },
      ]
      this.loading = true
      const { data } = await getpolicy5266(5266, this.params)
      if (data.length != 0) {
        this.tableData = data
      } else {
        this.tableData = []
      }
      this.loading = false
    },
    tableClick(result, text) {
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
          let path = 'userinfo'
          if (this.isMobile()) path = 'userInfo_app'
          this.$router.push({
            name: path,
            query: { Username: result.userName, workNum: result.workNumber, SenderID: result.senderID },
          })
          break
        default:
          break
      }
    },
    close() {
      this.row = {}
    },
  },
}
</script>

<style lang="scss" scoped>
.turnOutInfo {
  width: 100%;
  height: 100%;
  padding: 10px;

  .title {
    margin-bottom: 10px;
    color: var(--text-color);
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }

  :deep(.el-dialog) {
    border: 1px;
    border-radius: 10px;
    background: var(--user-popup-contentBgColor);
  }

  :deep(.el-dialog__title) {
    color: var(--text-color) !important;
  }

  :deep(.el-dialog__body) {
    padding: 10px;
  }
}
</style>
