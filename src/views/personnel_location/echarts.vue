<script>
import * as echarts from 'echarts'
import { getIndexData, getpolicy5281, getpolicy5339 } from '@/api/system/personnelLocation'
import { getinitBar, transitionKeyUp } from './downholeInfoJs'
import downUserNumInfoPopup from '@/components/personnelLocation/popups/downUserNumInfoPopup.vue'
import userInfoPopup from '@/components/personnelLocation/popups/userInfoPopup.vue'
import trackInfoPopup from '@/components/personnelLocation/popups/trackInfoPopup.vue'

let chart

export default {
  name: 'PersonnelEcharts',
  components: { downUserNumInfoPopup, userInfoPopup, trackInfoPopup },
  data() {
    return {
      barXData: [],
      barYData: [],
      btn: ['职务', '部门', '工种', '区域', '读卡器'],
      active: 0,
      userinfo: false,
      tableData: [],
      trackTotal: 0,
      name: '',
      Page: 1,
      Row: 20,
      total: 0,
      row: {},
      sync: false,
      track: false,
      userName: '',
      day: '',
      loading: false,
      trackLoading: false,
    }
  },
  mounted() {
    this.getChartData()
    this.initEcharts()
  },
  methods: {
    initEcharts(item) {
      getinitBar(this, document.getElementById('main'), '人', {}, '40%', false)
    },
    clickActive(index) {
      this.active = index
    },
    job(index, item) {
      this.getChartData(item)
    },
    async getChartData(type) {
      type = type == undefined ? '职务' : type
      const { data: dataList } = await getIndexData(5255, type)
      this.barXData = []
      this.barYData = []
      if (dataList != null && dataList.length != 0) {
        dataList.forEach((item) => {
          this.barXData.push(item.type)
          this.barYData.push(item.userNum)
        })
      }
      this.initEcharts(type)
    },
    async getBarInfo(param) {
      this.loading = true
      const { data } = await getpolicy5281(5281, param)
      this.tableData = []
      if (data[0].length != 0) {
        this.tableData = data[0].data
        this.total = Number(data[0].total)
      }
      this.loading = false
    },
    close() {
      this.row = {}
    },
    barclick(result) {
      this.name = result
      let rowData = { type: result }
      this.$refs.downUserNumInfoPopup.show(rowData, this.btn[this.active])
    },
  },
}
</script>

<template>
  <div class="box">
    <div class="btnList">
      <ul>
        <li
          :class="active == index ? 'active' : ''"
          @click="clickActive(index), job(index, item)"
          v-for="(item, index) in btn"
          :key="index"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <div class="main" id="main"></div>
    <downUserNumInfoPopup ref="downUserNumInfoPopup" :operation="true"></downUserNumInfoPopup>
    <trackInfoPopup ref="trackInfoPopup"></trackInfoPopup>
    <userInfoPopup ref="userInfoPopup"></userInfoPopup>
  </div>
</template>

<style scoped>
.active {
  background: var(--chart-btn-activeBgColor);
  color: var(--chart-btn-activeColor);
  font-family: var(--font-family);
  font-weight: bold;
}

ul {
  display: flex;
  justify-content: space-around;
  margin: 0;
  padding: 1px;
  border: 1px solid var(--chart-btn-borderColor);
  border-radius: 5px;
}

li {
  width: 60px;
  height: 30px;
  margin: 0;
  padding: 0;
  border-radius: 5px;
  line-height: 30px;
  list-style: none;
  text-align: center;
}

li:hover {
  cursor: pointer;
}

.box {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  justify-content: center;
  height: 100%;
}

.btnList {
  position: absolute;
  z-index: 999;
  top: 0;
  right: 0;
  margin: 10px;
  border: 1px;
  border-radius: 5px;
  background-color: var(--chart-btn-bgColor);
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

.main {
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: 0 10px;
  border: 1px;
  border-radius: 10px;
  background-color: var(--chart-bgColor);
}
</style>
