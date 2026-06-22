<template>
  <div class="userinfo personnel-page">
    <div class="header">
      <myheader :title="''" :showQuery="true" :showTab="false" :formItemList="yearSelected" @query="ChangeSearch" />
    </div>
    <div class="content">
      <div class="left" ref="left">
        <div class="chart">
          <div class="line">
            <chartHeader :title="`${params.Username} ${year}年 下井历史统计`" :unit="'单位/次'" />
            <div id="userLine"></div>
          </div>
        </div>
        <div class="table" :style="{ height: `${leftBoxHeight - 55}px` }">
          <span>{{ month }}月下井详情</span>
          <MyTable :tableData="tableData" :tableColumnOptions="columnOptions" :loading="loading" :selectionShow="false"
            :hasIndex="false" :maxHeight="leftBoxHeight - 55" :paginationShow="false" @columnClick="trackQuery" />
        </div>
      </div>
      <div class="right">
        <div class="chart">
          <MyUserInfoChart :year="year" :value="chartVal" :key="chartVal" />
        </div>
        <div class="count">
          <MyUserInfoTime ref="infoTime" :title="'累计下井时长'" :content="content1" :time="time"
            :key="new Date().getTime()" />
          <div class="bottom">
            <el-row :span="24">
              <el-col class="hj" :span="3">
                <div>合计</div>
              </el-col>
              <el-col :span="8">
                <span class="title">累计次数</span><span class="value">{{ count }}</span>
              </el-col>
              <el-col :span="12">
                <span class="title">累计时长</span>
                <span class="value">{{ time.HH }}</span><span class="text">时</span>
                <span class="value">{{ time.mm }}</span><span class="text">分</span>
                <span class="value">{{ time.ss }}</span><span class="text">秒</span>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="count">
          <MyUserInfoTime ref="infoTime" :title="'下井时长超时'" :content="content2" :key="new Date().getTime()" />
          <div class="bottom">
            <el-row :span="24">
              <el-col class="hj" :span="3">
                <div>合计</div>
              </el-col>
              <el-col :span="21"><span class="title">超时次数</span><span class="value">{{ timeout }}</span></el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
    <trackInfoPopup ref="trackInfoPopup"></trackInfoPopup>
  </div>
</template>

<script>
import MyTable from '@/components/personnelLocation/tableComponent.vue'
import chartHeader from '@/components/personnelLocation/echartsHeader.vue'
import MyUserInfoTime from '@/components/personnelLocation/userInfoTimeCom.vue'
import MyUserInfoChart from '@/components/personnelLocation/userInfoChart.vue'
import { getYear, GetinitLines, transitionKeyUp } from '../downholeInfoJs'
import { getpolicy } from '@/api/system/personnelLocation'
import myheader from '@/components/personnelLocation/header.vue'
import trackInfoPopup from '@/components/personnelLocation/popups/trackInfoPopup.vue'

export default {
  name: 'UserInfo',
  components: { MyUserInfoTime, MyUserInfoChart, chartHeader, MyTable, myheader, trackInfoPopup },
  data() {
    return {
      years: [], year: '', month: '', loading: false,
      lineXData: [1, 2], lineYData: [10, 12],
      lineYDataTimeOut: [], lineYDataNormal: [], lineYDataAll: [],
      yearSelected: [{ label: '年份', param: 'year', type: 'select', selectOptions: [], defaultSelect: '' }],
      tableData: [],
      columnOptions: [
        { label: '#', prop: '序号' }, { label: '日期', prop: '日期' },
        { label: '姓名', prop: 'userName' }, { label: '卡号', prop: 'senderID' },
        { label: '下井时间', prop: 'downWellTime', width: 180 }, { label: '上井时间', prop: 'upWellTime', width: 180 },
        { label: '下井时长', prop: '下井时长' }, { label: '小时', prop: '小时' },
        { label: '班次', prop: 'shiftId' },
        {
          columnType: true, label: '轨迹查询', prop: 'edit', isEvent: true, width: 80,
          slots: [{ soltName: 'trackQuery', data: '查看', isInMore: false, isEvent: true }]
        },
      ],
      content1: [{ title: '班次', value: '-' }, { title: '累计次数', value: 0 }, { title: '累计时长', value: '0时0分0秒' }],
      content2: [],
      time: { HH: 0, mm: 0, ss: 0 }, count: 0, params: {}, chartVal: 0, timeout: 0,
      trackColumn: [
        { label: '#', prop: 'num' }, { label: '位置', prop: 'DevicePosition' },
        { label: '进入时间', prop: 'EnterTime', width: 180 }, { label: '距离', prop: 'Direction' },
        { label: '离开时间', prop: 'EnterTime', width: 180 }, { label: '停留时间', prop: 'StopTime' },
      ],
      leftBoxHeight: 0, row: {},
    }
  },
  created() {
    this.init()
    const params = { ...this.$route.query, year: this.year, month: this.month }
    this.params = params
    this.axiosAll()
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.left) this.leftBoxHeight = Number(this.$refs.left.offsetHeight) / 2
    })
  },
  methods: {
    init() {
      const data = getYear()
      console.log(data);
      this.years = data.years;
      this.year = data.year.toString();
      console.log(this.year);
      this.month = data.month
      this.yearSelected[0].selectOptions = this.years
      this.yearSelected[0].defaultSelect = this.year
    },
    getpolyc5288() {
      getpolicy(5288, this.params).then(({ data }) => {
        this.chartVal = 0
        if (data.length != 0) data.forEach((item) => { this.chartVal = item.value })
      })
    },
    async getpolyc5286() {
      this.loading = true
      const { data } = await getpolicy(5286, this.params)
      this.tableData = data.length != 0 ? data : []
      this.loading = false
    },
    getpolyc5282() {
      getpolicy(5282, this.params).then(({ data }) => {
        this.lineXData = []; this.lineYDataAll = []; this.lineYDataNormal = []; this.lineYDataTimeOut = []
        if (data.length != 0) {
          data.forEach((item) => {
            this.lineXData.push(item.month + '月' + (item.shiftId == '空' ? '' : item.shiftId))
            this.lineYDataAll.push(item.all); this.lineYDataNormal.push(item.normal); this.lineYDataTimeOut.push(item.timeout)
          })
          GetinitLines(this, document.getElementById('userLine'), '次')
        }
      })
    },
    getpolyc5320() {
      getpolicy(5320, this.params).then(({ data }) => {
        if (data.length != 0) {
          let count = 0
          data.forEach((item) => { count += item.timeout })
          this.content2 = [{ title: '班次', value: '-' }, { title: '超时次数', value: count }]
          this.timeout = count
        }
      })
    },
    getpolyc5287() {
      getpolicy(5287, this.params).then(({ data }) => {
        this.time = { HH: 0, mm: 0, ss: 0 }
        this.content1 = [{ title: '班次', value: '-' }, { title: '累计次数', value: 0 }, { title: '累计时长', value: '0时0分0秒' }]
        this.count = 0
        if (data.length != 0) {
          let downTime = data[0].downTime
          this.content1.forEach((item, index) => {
            if (item.title == '累计时长') {
              this.time.HH = downTime.substring(0, downTime.indexOf('时'))
              this.time.mm = downTime.substring(downTime.indexOf('时') + 1, downTime.indexOf('分'))
              this.time.ss = downTime.substring(downTime.indexOf('分') + 1, downTime.indexOf('秒'))
            } else if (item.title == '累计次数') {
              this.count = data[0].count; this.content1[index].value = data[0].count
            }
          })
        }
      })
    },
    ChangeSearch(result) {
      this.year = result.year; this.params.year = result.year; this.params.month = this.month
      this.axiosAll()
    },
    trackQuery(result, track) {
      let param = transitionKeyUp(result)
      this.$refs.trackInfoPopup.show(param)
    },
    axiosAll() {
      this.getpolyc5288(); this.getpolyc5286(); this.getpolyc5282(); this.getpolyc5320(); this.getpolyc5287()
    },
  },
}
</script>

<style lang="scss" scoped>
.userinfo {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px;

  .header {
    padding: 0 10px;
  }

  .content {
    display: flex;
    box-sizing: border-box;
    justify-content: space-around;
    width: 100%;
    height: 90%;
    padding: 10px;

    .left,
    .right {
      box-sizing: border-box;
      width: 100%;
      padding: 10px;
      border-radius: 10px;
      background: var(--BgColor);
    }

    .left {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      width: 70%;
      margin-right: 10px;

      .chart {
        width: 100%;
        height: 50%;

        .line {
          width: 100%;
          height: 100%;

          #userLine {
            width: 100%;
            height: 100%;
          }
        }
      }

      .chart,
      .table {
        box-sizing: border-box;
        padding: 10px;
        border-radius: 10px;
        background-color: var(--chart-bgColor);
        color: var(--text-color);
      }

      .table {
        box-sizing: border-box;
        margin-top: 10px;
      }
    }

    .right {
      display: flex;
      box-sizing: border-box;
      flex-direction: column;
      justify-content: space-around;
      width: 30%;
      margin: 10px 0;
      background-color: var(--chart-bgColor);

      .count {
        box-sizing: border-box;

        .bottom {
          .el-row {
            border-top: 1px solid var(--count-BorderColor);
            background: var(--count-BgColor);

            .el-col {
              height: 100%;
              line-height: 30px;
              text-align: center;

              .title {
                margin-right: 10px;
              }

              .value {
                color: var(--count-bottomText);
                font-size: 16px;
              }

              .text {
                margin: 0 5px;
                color: rgb(248 196 62 / 50%);
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
