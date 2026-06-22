<template>
  <div class="downHoleInfo personnel-page">
    <div class="header">
      <div class="header-left">
        <div class="back" @click="$router.back(-1)">
          <svg class="back-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          <span class="back-text">返回</span>
        </div>
        <div class="title">
          <span>人员定位历史下井信息</span>
        </div>
      </div>
      <div class="header-right">
        <div class="year">
          <span>年份 </span>
          <select v-model="year" class="yearselect" placeholder="请选择" @change="yearChange($event)">
            <option v-for="item in years" :key="item.value" :label="item.name" :value="item.value" />
          </select>
        </div>
        <div class="btn">
          <router-link to="/personalCount">
            <el-button type="primary" size="small">人员出勤统计</el-button>
          </router-link>
        </div>
      </div>
    </div>
    <div v-if="!lineFull && !barFull" class="line">
      <div class="header-box">
        <div>
          <span class="title">{{ year }}年 每月下井人数 </span>
          <span class="dw">单位/人</span>
        </div>
      </div>
      <div id="chartHeader-line"></div>
    </div>
    <div v-if="!lineFull && !barFull" class="bar">
      <div class="header-box">
        <div>
          <span class="title">{{ month }}月 每天下井统计 </span>
          <span class="dw">单位/人</span>
        </div>
      </div>
      <div id="chartHeader-bar"></div>
    </div>
  </div>
</template>

<script>
import { getDownHoleBarData } from '@/api/system/personnelLocation'
import { getMineName } from '@/api/system/helpers'
import { getYear, getLineData, GetinitLine, stackbar } from './downholeInfoJs'

export default {
  name: 'DownholeInfo',
  data() {
    return {
      years: [],
      year: '',
      month: '',
      day: '',
      lineXData: [],
      lineYData: [],
      lineFull: false,
      barXData: [],
      barYData: [],
      data: [],
      barFull: false,
      chartsCurrentData: {},
      str: [
        { k: 1, v: '一月' }, { k: 2, v: '二月' }, { k: 3, v: '三月' },
        { k: 4, v: '四月' }, { k: 5, v: '五月' }, { k: 6, v: '六月' },
        { k: 7, v: '七月' }, { k: 8, v: '八月' }, { k: 9, v: '九月' },
        { k: 10, v: '十月' }, { k: 11, v: '十一月' }, { k: 12, v: '十二月' },
      ],
      title: [],
    }
  },
  mounted() {
    this.getYearData()
    this.initEchart()
  },
  watch: {
    $route: {
      handler(val) {
        if (val.path == '/downholeinfo') this.initEchart()
      },
    },
  },
  methods: {
    initEchart() {
      this.getLine()
      this.getBarData()
    },
    initLine() {
      GetinitLine(this, document.getElementById('chartHeader-line'), '人数')
    },
    initBar() {
      let routeInfo = { path: 'downholepersonNum', param: { year: this.year, month: this.month } }
      stackbar(this, document.getElementById('chartHeader-bar'), '人数', routeInfo)
    },
    getYearData() {
      let data = getYear()
      this.years = data.years
      this.year = data.year
      this.day = data.day
      this.month = data.month
    },
    yearChange(val) {
      let date = new Date()
      date.setFullYear(val.target.value)
      this.getLine()
      this.month = date.getMonth() + 1
      this.getBarData()
    },
    async getLine() {
      this.lineXData = []
      this.lineYData = []
      const data = await getLineData(this.str, this.year)
      this.lineXData = data.lineXData
      this.lineYData = data.lineYData
      this.initLine()
    },
    async getBarData() {
      const { data } = await getDownHoleBarData(5261, getMineName(), this.year, this.month)
      this.barXData = []
      this.barYData = []
      this.title = []
      if (data != null && data.length != 0) this.data = data
      this.initBar()
    },
  },
}
</script>

<style scoped lang="scss">
.downHoleInfo {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
  padding: 10px;

  .line { margin-bottom: 20px; }

  #chartHeader-line,
  #chartHeader-bar {
    width: 100%;
    height: 95%;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;

    .header-left {
      display: flex;
      align-items: center;
      justify-content: space-around;

      .back {
        display: flex;
        align-items: center;
        height: 30px;
        margin-right: 20px;
        padding: 4px 12px;
        border: 1px solid var(--back-btn-border);
        border-radius: 100px;
        background-color: var(--back-btn-bgColor);
        color: var(--back-btn-color);
        gap: 8px;
        font-family: var(--font-family);
        :hover { cursor: pointer; }
      }

      .title span {
        background: var(--textBgColor);
        background-clip: text;
        color: transparent;
        font-size: 30px;
        font-weight: bold;
      }
    }

    .header-right {
      display: flex;
      justify-content: space-around;
      gap: 24px;

      .yearselect {
        justify-content: space-between;
        width: 152px;
        height: 26px;
        padding: 2px 8px 2px 0;
        border: 1px solid rgb(130 153 194 / 40%);
        border-radius: 2px;
        background: transparent;
        color: var(--text-color);
        font-family: var(--font-family);
        option { background: var(--BgColor); }
      }
    }
  }

  .line,
  .bar {
    flex: 1;
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    background-color: var(--chart-bgColor);

    .header-box {
      display: flex;
      justify-content: space-between;
      :first-child .dw { color: #77818b; }
    }
  }
}
</style>
