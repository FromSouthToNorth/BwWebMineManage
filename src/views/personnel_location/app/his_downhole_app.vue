<template>
  <div class="his_downhole_app">
    <div class="year-selected">
      <ul>
        <li
          v-for="item in years"
          :key="item.value"
          :class="year == item.value ? 'active' : ''"
          @click="onTabClick(item.value)"
        >
          {{ item.value }}年
        </li>
      </ul>
    </div>
    <div class="charts-container">
      <div class="chart-wrapper">
        <div class="title">
          <span>{{ year }}年 每月下井人数</span>
          <span class="unit">单位/人</span>
        </div>
        <div class="chart">
          <div id="line-chart" :style="{ width: '100%', height: '100%' }"></div>
          <div v-if="loading" class="chart-loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">数据加载中...</div>
          </div>
        </div>
      </div>
      <div class="chart-wrapper">
        <div class="title">
          <span>{{ month }}月 每日下井人数</span>
          <span class="unit">单位/人</span>
        </div>
        <div class="chart">
          <div
            id="bar-chart"
            @touchstart="touchstart"
            @touchmove="touchmove"
            @touchend="touchend"
            :style="{ width: '100%', height: '100%' }"
          ></div>
          <div v-if="loading" class="chart-loading-overlay">
            <div class="loading-spinner"></div>
            <div class="loading-text">数据加载中...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getYear,
  getLineData,
  GetinitLine,
  stackbar_app,
} from "@/views/personnel_location/downholeInfoJs";
import {
  getDownHoleLineData,
  getDownHoleBarData,
} from "@/api/system/personnelLocation";
import { getMineName } from "@/api/system/helpers";
export default {
  name: "his_downhole_app",
  components: {},
  data() {
    return {
      years: [],
      year: "2023",
      month: "",
      str: [
        { k: 1, v: "一月" },
        { k: 2, v: "二月" },
        { k: 3, v: "三月" },
        { k: 4, v: "四月" },
        { k: 5, v: "五月" },
        { k: 6, v: "六月" },
        { k: 7, v: "七月" },
        { k: 8, v: "八月" },
        { k: 9, v: "九月" },
        { k: 10, v: "十月" },
        { k: 11, v: "十一月" },
        { k: 12, v: "十二月" },
      ],
      lineXData: [],
      lineYData: [],
      page: 1,
      size: 10,
      total: 0,
      data: [],
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isMove: false,
      loading: false,
    };
  },
  mounted() {
    this.getYearData();
    this.getLine();
    this.getBarData();
  },
  watch: {
    $route: "mountedChart",
  },
  methods: {
    touchstart(e) {
      this.startX = e.touches[0].pageX;
      this.startY = e.touches[0].pageY;
    },
    touchmove(e) {
      this.isMove = true;
      this.endX = e.touches[0].pageX;
      this.endY = e.touches[0].pageY;
    },
    touchend(e) {
      let X = this.endX - this.startX,
        Y = this.endY - this.startY;
      if (this.isMove) {
        if (X > 0 && Math.abs(X) > Math.abs(Y)) {
          if (this.page <= 1) {
            this.isMove = false;
            return;
          }
          if (this.page != 1) {
            this.page = this.page - 1;
          }
          if (this.page > this.total) {
            return;
          }
          this.initBar();
        } else if (X < 0 && Math.abs(X) > Math.abs(Y)) {
          if (this.page >= this.total) {
            this.isMove = false;
            return;
          }
          if (this.page < this.total) {
            this.page = this.page + 1;
          }
          if (this.page > this.total) {
            return;
          }
          this.initBar();
        }
      }
    },
    getYearData() {
      let data = getYear();
      this.years = data.years;
      this.year = data.year;
      this.day = data.day;
      this.month = data.month;
    },
    async getLine() {
      this.loading = true;
      try {
        this.lineXData = [];
        this.lineYData = [];
        const data = await getLineData(this.str, this.year);
        this.lineXData = data.lineXData;
        this.lineYData = data.lineYData;
        this.initLine();
      } finally {
        this.loading = false;
      }
    },
    async getBarData() {
      this.loading = true;
      try {
        const MineName = getMineName();
        const { data } = await getDownHoleBarData(
          5261,
          MineName,
          this.year,
          this.month
        );
        this.data = [];
        if (data != null && data.length != 0) {
          this.data = data;
        }
        this.page = 1;
        this.initBar();
      } finally {
        this.loading = false;
      }
    },
    initLine(a) {
      GetinitLine(this, document.getElementById("line-chart"), "人数", false);
    },
    initBar() {
      let routeInfo = {
        path: "downholeNum_app",
        param: {
          year: this.year,
          month: this.month,
        },
      };
      stackbar_app(
        this,
        document.getElementById("bar-chart"),
        "人数",
        routeInfo,
        false
      );
    },
    dataClickNext() {
      this.page = this.page + 1;
      this.initBar();
    },
    dataClickNev() {
      this.page = this.page - 1;
      this.initBar();
    },
    onTabClick(value) {
      this.year = value;
      this.getLine();
      this.getBarData();
    },
    mountedChart() {
      if (this.$route.path == "his_downhole_app") {
        this.initLine();
        this.initBar();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.his_downhole_app {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
  overflow: hidden;

  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  ul {
    display: table;
    box-sizing: border-box;
    width: 80%;
    height: 30px;
    margin: 0 auto;
    margin-bottom: 10px;
    padding: 3px;
    border: 1px solid var(--chart-btn-borderColor);
    border-radius: 4px;
    background: var(--chart-btn-bgColor);
    color: var(--text-color);
    text-align: center;
  }

  li {
    display: table-cell;
    box-sizing: border-box;
    height: 30px;
    border: 1px;
    border-radius: 4px;
    line-height: 30px;
  }

  .active {
    background-color: var(--chart-btn-activeBgColor);
    color: var(--highlight-color);
  }

  ::v-deep .dialog-search {
    justify-content: right;
    margin: 0;
  }

  .charts-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;
    padding: 0 10px 10px;
    overflow: hidden;
  }

  .chart-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: var(--chart-bgColor);
    padding: 10px;
    border-radius: 4px;
  }

  .title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .unit {
      color: gray;
      font-size: 12px;
    }
  }

  .chart {
    flex: 1;
    min-height: 0;
    position: relative;
  }

  .chart-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 10px;
  }

  .loading-text {
    color: #fff;
    font-size: 14px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
