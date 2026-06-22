<template>
  <div class="location-app">
    <div class="box1">
      <!-- 报警栏 -->
      <div class="alarm">
        <el-row :span="24">
          <el-col :span="20" class="alarm-number">
            <p>
              当前设备报警数 <span>{{ box1_data.deviceNum }}</span
              >台, 当前人员报警数 <span>{{ box1_data.userNum }}</span
              >人
            </p>
          </el-col>
          <el-col :span="4" class="alarm-icon">
            <i class="el-icon-circle-close" />
          </el-col>
        </el-row>
      </div>
      <div class="downHoleNumber">
        <!-- 图表 -->
        <div id="downHoleNumber-bar" style="width: 100%; height: 200px"></div>
        <el-divider></el-divider>
        <div style="margin-top: 20px">
          <el-row :span="24">
            <el-col :span="12">
              <p>
                当天下井人数<span> {{ box1_data.dayNum }} </span>人
              </p>
            </el-col>
            <el-col :span="12">
              <p>
                当前下井人数<span> {{ box1_data.currNum }} </span>人
              </p>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div class="box2">
      <div class="box2-content">
        <div class="title">
          <el-row :span="24">
            <el-col :span="21"
              ><span>各{{ title }}人数</span></el-col
            >
            <el-col :span="3"><span class="unit">单位/人</span></el-col>
          </el-row>
        </div>
        <div class="btnList">
          <ul>
            <li
              v-for="(item, index) in btn"
              :key="index"
              :class="activeIndex == index ? 'active' : ''"
              @click="clickActive(index), job(index, item)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <div style="position: relative">
          <div
            class="chartBox"
            @touchstart="touchstart"
            @touchmove="touchmove"
            @touchend="touchend"
          >
            <div
              id="bar"
              :style="{ width: '100%', height: `${clientHeight / 2}px` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div v-for="(item, index) in tables" :key="index" class="table">
      <div @click="item.title != '带班领导' && onTableBoxClick(item.name)">
        <p>{{ item.title }}</p>
      </div>
      <my-table
        :tableData="item.data"
        :tableColumnOptions="item.props"
        :loading="false"
        :hasIndex="false"
        :selectionShow="false"
        :paginationShow="false"
        :columnBgColor="{
          oddColor: '#0a1820',
          evenColor: '#0b202a',
        }"
        @rowClick="rowClick(arguments[0], item.name)"
      />
    </div>
    <!-- 柱状图点击弹窗 -->
    <personQuery
      v-if="userinfo"
      :isShow.sync="userinfo"
      :isQuery="false"
      :title="`${name} 人员信息`"
      :tableData="tableData"
      :loading="loading"
      :columnOptions="tableColumn"
      :isShowFooter="false"
      :hasIndex="false"
      :width="'100%'"
      :paginationShow="true"
      :total="total"
      :small="true"
      :pageCount="4"
      :layOut="'total,prev,pager, next'"
      :modal="true"
      :size="5"
      @tableChange="tableChange"
      @columnClick="tableClick"
    />

    <personQuery
      v-if="open"
      :isShow.sync="open"
      :title="openTitle"
      :width="'100%'"
      :isQueryBtn="isQueryBtn"
      :isResetBtn="false"
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
      :loading="loading"
      :modal="true"
      :small="true"
      :pageCount="4"
      :layOut="'total,prev,pager, next'"
      :size="5"
      @soltHandel="deviceSoltHandel(currentType)"
      @dateChange="search"
      @close="close"
      @columnClick="tableClick"
      @tableChange="tabPage"
    />
    <userInfoPopup ref="userInfoPopup"></userInfoPopup>
    <operation
      :visible.sync="operation"
      :list="operationList"
      @close="operationClose"
      @operationClick="operationClick"
    />
  </div>
</template>

<script>
import * as echarts from "echarts";
import myTable from "@/components/personnelLocation/tableComponent.vue";
import operation from "@/components/personnelLocation/operationPopup.vue";
import userInfoPopup from "@/components/personnelLocation/popups/userInfoPopup.vue";
import {
  getIndexData,
  getpolicy5281,
  indexTablePopup,
  getPolicy5400,
  getPolicy5401,
  GetStrategyJsonData,
} from "@/api/system/personnelLocation";
import { transitionKeyUp } from "@/views/personnel_location/downholeInfoJs";
import personQuery from "@/components/personnelLocation/trajectoryQuery.vue";
import { DATA_THEME } from "@/utils/constants";

// 图表实例管理
let chartInstances = {
  pieChart: null,
  barChart: null,
};
export default {
  name: "location-app",
  components: { myTable, personQuery, operation, userInfoPopup },
  data() {
    return {
      clientHeight:
        document.documentElement.clientHeight || document.body.clientHeight,
      title: "职务",
      openTitle: "",
      btn: ["职务", "部门", "工种", "区域", "读卡器"],
      activeIndex: 0,
      currentType: "",
      tables: [
        {
          title: "带班领导",
          name: "teamLeader",
          data: [],
          props: [
            { label: "姓名", prop: "userName", isEvent: true },
            { label: "卡号", prop: "senderID" },
            { label: "部门", prop: "department" },
            { label: "职务", prop: "rank" },
          ],
        },
        {
          title: "设备报警",
          name: "deviceAlarm",
          data: [],
          props: [
            {
              label: "报警类型",
              prop: "alarmType",
              color: "rgba(255, 101, 101, 1)",
            },
            { label: "设备编号", prop: "number" },
            { label: "设备名称", prop: "name" },
            {
              label: "报警时间",
              prop: "alarmTime",
              width: 150,
              color: "rgba(255, 101, 101, 1)",
            },
          ],
        },
        {
          title: "人员报警",
          name: "personAlarm",
          data: [],
          props: [
            {
              label: "报警类型",
              prop: "alarmType",
              color: "rgba(255, 101, 101, 1)",
            },
            { label: "姓名", prop: "userName" },
            { label: "卡号", prop: "senderID" },
            {
              label: "报警时间",
              prop: "alarmTime",
              width: 150,
              color: "rgba(255, 101, 101, 1)",
            },
          ],
        },
      ],
      box1_data: {
        currNum: 0,
        dayNum: 0,
        deviceNum: 0,
        userNum: 0,
      },
      downUserNum: ["当前", "当天"],
      pieData: [],
      pieTotal: 0,
      barYData: [],
      barXData: [],
      /* 分页相关 */
      Page: 1,
      size: 10,
      total: 0,
      userinfo: false,
      name: "",
      tableData: [],
      tableColumn: [
        {
          label: "#",
          prop: "num",
          width: 50,
        },
        {
          label: "姓名",
          prop: "UserName",
          isEvent: true,
        },
        {
          label: "卡号",
          prop: "WorkNumber",
        },
        {
          label: "当前位置",
          prop: "DevicePosition",
          width: 180,
        },
        {
          label: "距离",
          prop: "Direction",
        },
        {
          label: "下井时间",
          prop: "DownWellTime",
          width: 180,
        },
        {
          label: "班次",
          prop: "Shift",
        },
      ],
      formItemList: [],
      customBtn: [
        {
          soltName: "query",
          btnName: "历史报警",
        },
      ],
      isQueryBtn: false,
      isQuery: false,
      pageShow: false,
      open: false,
      loading: false,
      searchBarData: {},
      row: {},
      operationList: ["人员信息", "轨迹查询", "出勤统计"],
      operation: false,
      timer: null,
      /* PaginationMixin data */
      page: 1,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isMove: false,
    };
  },
  beforeMount() {
    let h = document.documentElement.clientHeight || document.body.clientHeight;
    this.clientHeight = h;
  },
  beforeDestroy() {
    this.clear();
    this.destroyCharts();
  },
  mounted() {
    this.initClientHeight();
    this.GetPolicy5452();
    this.getChartData();
    this.getWarnData();
    this.getTableList();
    this.downUserNum.forEach((item) => {
      this.getNum(item);
    });
    this.dataRefrech();
  },
  methods: {
    /* 定时刷新 */
    dataRefrech() {
      if (this.timer != null) return;
      this.timer = setInterval(() => {
        this.getWarnData();
        this.getTableList();
        this.downUserNum.forEach((item) => {
          this.getNum(item);
        });
      }, 5000);
    },
    clear() {
      clearInterval(this.timer);
      this.timer = null;
    },
    async getWarnData() {
      const { data } = await GetStrategyJsonData(6794, null);
      this.box1_data.deviceNum = data.DeviceAlarms;
      this.box1_data.userNum = data.PersonnelAlarms;
    },
    /** AppMixin methods inlined */
    getClientHeight() {
      return document.documentElement.clientHeight || document.body.clientHeight;
    },
    initClientHeight() {
      this.clientHeight = this.getClientHeight();
      window.addEventListener('resize', () => {
        this.clientHeight = this.getClientHeight();
      });
    },
    touchstart(e) {
      this.startX = e.touches[0].pageX;
      this.startY = e.touches[0].pageY;
    },
    touchmove(e) {
      this.isMove = true;
      this.endX = e.touches[0].pageX;
      this.endY = e.touches[0].pageY;
    },
    touchend(callback) {
      let X = this.endX - this.startX,
        Y = this.endY - this.startY;
      if (this.isMove) {
        if (X > 0 && Math.abs(X) > Math.abs(Y)) {
          callback && callback('right');
        } else if (X < 0 && Math.abs(X) > Math.abs(Y)) {
          callback && callback('left');
        }
        this.isMove = false;
      }
    },
    calculateTotalPages(data, size) {
      return data.length % size === 0
        ? data.length / size
        : Math.ceil(data.length / size);
    },
    /** PaginationMixin methods inlined */
    handlePagination(direction) {
      if (direction === 'right') {
        if (this.page <= 1) return;
        this.page--;
      } else if (direction === 'left') {
        if (this.page >= this.total) return;
        this.page++;
      }
      if (this.page > 0 && this.page <= this.total) {
        this.initBar();
      }
    },
    dataClickNext() {
      if (this.page < this.total) {
        this.page++;
        this.initBar();
      }
    },
    dataClickNev() {
      if (this.page > 1) {
        this.page--;
        this.initBar();
      }
    },
    /** Chart management */
    initChart(chartType, domId, option) {
      if (chartInstances[chartType]) {
        chartInstances[chartType].dispose();
      }
      const chartDom = document.getElementById(domId);
      chartInstances[chartType] = echarts.init(chartDom);
      chartInstances[chartType].setOption(option);
      const resizeHandler = () => {
        chartInstances[chartType].resize();
      };
      window.addEventListener("resize", resizeHandler);
      chartInstances[chartType]._resizeHandler = resizeHandler;
      return chartInstances[chartType];
    },
    destroyCharts() {
      Object.values(chartInstances).forEach((chart) => {
        if (chart) {
          if (chart._resizeHandler) {
            window.removeEventListener("resize", chart._resizeHandler);
          }
          chart.dispose();
        }
      });
      chartInstances = { pieChart: null, barChart: null };
    },
    /* 饼图 */
    initEchart() {
      const rootElement = document.documentElement;
      const ComputedStyle = getComputedStyle(rootElement);
      const option = {
        title: [
          {
            textStyle: { fontSize: 15, color: "#fff" },
            left: "2%",
          },
          {
            text: "总人数",
            subtext: this.pieTotal,
            textStyle: { fontSize: 15, color: ComputedStyle.getPropertyValue("--text-color") },
            subtextStyle: { fontSize: 20, color: ComputedStyle.getPropertyValue("--text-color") },
            textAlign: "center",
            x: "34.5%",
            y: "40%",
          },
        ],
        tooltip: {
          trigger: "item",
          formatter: (parms) => {
            return `${parms.seriesName}</br>${parms.marker}${parms.data.legendname}</br>数量：${parms.data.value}</br>占比：${parms.percent}%`;
          },
        },
        legend: {
          type: "scroll",
          orient: "vertical",
          left: "70%",
          align: "left",
          top: "30",
          textStyle: { color: ComputedStyle.getPropertyValue("--text-color"), fontSize: 12 },
          height: 270,
        },
        series: [
          {
            name: "职务",
            type: "pie",
            center: ["35%", "50%"],
            radius: ["100%", "70%"],
            clockwise: false,
            avoidLabelOverlap: true,
            label: { show: false, position: "outter", formatter: (parms) => parms.data.legendname },
            labelLine: { length: 5, length2: 3, smooth: true },
            data: this.pieData,
          },
        ],
      };
      this.initChart("pieChart", "downHoleNumber-bar", option);
    },
    async GetPolicy5452() {
      let colors = [];
      if (localStorage.getItem(DATA_THEME) == "light") {
        colors = [
          { color: "rgba(0, 97, 248, 1)" },
          { color: "rgba(123, 31, 244, 1)" },
          { color: "rgba(74, 147, 245, 1)" },
          { color: "rgba(1, 210, 255, 1)" },
          { color: "rgba(202, 227, 255, 1)" },
        ];
        colors.reverse();
      } else {
        colors = [
          { color: "rgba(0, 255, 255, 1)" },
          { color: "rgba(250, 255, 0, 1)" },
          { color: "rgba(255, 153, 0, 1)" },
          { color: "rgba(195, 241, 255, 1)" },
          { color: "rgba(0, 102, 255, 1)" },
        ];
        colors.reverse();
      }
      const { data: result } = await GetStrategyJsonData(5452);
      if (result.length != 0) {
        result[0].data.sort(this.sortBy("value", 1));
        result[0].data.forEach((item, index) => {
          item.legendname = item.name;
          item.name = `${item.name} ${item.value}`;
          item.itemStyle = colors[index];
          this.pieTotal += item.value;
        });
        this.pieData = result[0].data;
        this.initEchart();
      }
    },
    sortBy(attr, rev) {
      if (rev == undefined) rev = 1;
      return function (a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b) return rev * -1;
        if (a > b) return rev * 1;
        return 0;
      };
    },
    /* 柱状图 */
    initBar() {
      const rootElement = document.documentElement;
      const ComputedStyle = getComputedStyle(rootElement);
      const start = (this.page - 1) * this.size;
      const end = this.page * this.size;
      let option = {
        tooltip: {
          trigger: "axis",
          show: true,
          axisPointer: { type: "shadow" },
          extraCssText: "z-index:3",
        },
        grid: { left: 10, right: "10", bottom: "15", top: "10", containLabel: true },
        xAxis: { type: "value", boundaryGap: [0, 0.01], show: false },
        yAxis: {
          type: "category",
          inverse: true,
          axisTick: { show: false },
          axisLine: { show: false, lineStyle: { color: ComputedStyle.getPropertyValue("--text-color") } },
          axisLabel: { show: false, color: ComputedStyle.getPropertyValue("--text-color") },
          data: this.barXData.slice(start, end),
        },
        series: [
          {
            name: "人数",
            type: "bar",
            data: this.barYData.slice(start, end),
            barWidth: "80%",
            label: {
              show: true,
              formatter: "{b}",
              position: "left",
              align: "left",
              offset: [10, 0],
              color: ComputedStyle.getPropertyValue("--text-color"),
              fontSize: 12,
            },
            barCateGoryGap: "0%",
          },
        ],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(0, 201, 189, 1)" },
          { offset: 1, color: "rgba(17, 124, 184, 1)" },
        ]),
      };
      const chart = this.initChart("barChart", "bar", option);
      chart.on("click", (params) => {
        this.name = params.name;
        let param = {
          type: this.btn[this.activeIndex],
          str: this.name,
          Page: this.Page,
          Row: 5,
        };
        this.getBarInfo(param);
        this.userinfo = true;
      });
    },
    clickActive(index) {
      this.activeIndex = index;
    },
    job(_, item) {
      this.title = item;
      this.getChartData(item);
    },
    async getNum(type) {
      const { data: dataList } = await getIndexData(5285, type);
      if (dataList != null && dataList.length != 0) {
        if (type == "当前") {
          this.box1_data.currNum = dataList[0].num;
        } else {
          this.box1_data.dayNum = dataList[0].num;
        }
      }
    },
    getTableList() {
      this.tables.forEach((item, index) => {
        getIndexData(5259, item.title).then(({ data: dataList }) => {
          if (dataList != null && dataList.length != 0) {
            this.tables[index].data = dataList;
          }
        });
      });
    },
    async getChartData(type) {
      this.page = 1;
      this.total = 0;
      type = type == undefined ? "职务" : type;
      const { data: dataList } = await getIndexData(5255, type);
      this.barXData = [];
      this.barYData = [];
      if (dataList != null && dataList.length != 0) {
        dataList.forEach((item) => {
          this.barXData.push(item.type);
          this.barYData.push(item.userNum);
        });
      }
      this.total = this.calculateTotalPages(this.barYData, this.size);
      this.initBar(type);
    },
    async getBarInfo(param) {
      this.loading = true;
      const { data } = await getpolicy5281(5281, param);
      this.tableData = [];
      if (data[0].length != 0) {
        this.tableData = data[0].data;
        this.total = Number(data[0].total);
        this.loading = false;
      }
    },
    tableChange(result) {
      let param = {
        type: this.btn[this.activeIndex],
        str: this.name,
        Page: result.currentPage,
        Row: result.pageSize,
      };
      this.getBarInfo(param);
    },
    async getPolicy5399_5398_5410(id) {
      this.loading = true;
      const { data } = await indexTablePopup(id);
      this.tableData = [];
      if (data.length != 0) {
        this.tableData = data;
      }
      this.loading = false;
    },
    async getSelectOptions(index) {
      const { data } = await getPolicy5400();
      this.formItemList[index].selectOptions = [];
      if (data.length != 0) {
        this.formItemList[index].selectOptions = data[0].Alarmtype;
      }
    },
    async getPolicy5401(param) {
      this.loading = true;
      const { data } = await getPolicy5401(5401, param);
      this.tableData = [];
      if (data.length != 0) {
        this.tableData = data[0].data;
        this.total = Number(data[0].total);
      }
      this.loading = false;
    },
    rowClick(_, name) {
      const tableItem = this.tables.find((item) => item.name === name);
      this.openTitle = tableItem ? tableItem.title : name;
      this.currentType = name;
      switch (name) {
        case "teamLeader":
          this.tableColumn = [
            { label: "姓名", prop: "userName", isEvent: true },
            { label: "卡号", prop: "senderID" },
            { label: "职务", prop: "rank" },
            { label: "当前位置", prop: "devicePosition", width: 200 },
            { label: "距离", prop: "direction" },
            { label: "下井时间", prop: "downWellTime", width: 180 },
            { label: "班次", prop: "shift" },
          ];
          this.getPolicy5399_5398_5410(5410);
          this.isQuery = false;
          this.customBtn = [];
          this.open = true;
          break;
        case "deviceAlarm":
          this.tableColumn = [
            { label: "报警类型", prop: "alarmtype" },
            { label: "设备编号", prop: "number" },
            { label: "设备名称", prop: "name" },
            { label: "报警内容", prop: "remarks" },
            { label: "报警时间", prop: "alarmTime" },
          ];
          this.formItemList = [];
          this.getPolicy5399_5398_5410(5399);
          this.isQuery = true;
          this.isQueryBtn = false;
          this.open = true;
          break;
        case "personAlarm":
          this.isQuery = true;
          this.formItemList = [];
          this.isQueryBtn = false;
          this.tableColumn = [
            { label: "报警类型", prop: "alarmtype" },
            { label: "姓名", prop: "userName", isEvent: true },
            { label: "卡号", prop: "senderID" },
            { label: "部门", prop: "department" },
            { label: "职务", prop: "rank" },
            { label: "内容", prop: "remarks" },
            { label: "报警时间", prop: "alarmTime", width: 180 },
            { label: "当前位置", prop: "devicePosition", width: 200 },
          ];
          this.getPolicy5399_5398_5410(5398);
          this.open = true;
          break;
      }
    },
    deviceSoltHandel(title) {
      const alarmConfig = {
        deviceAlarm: {
          typeNum: 1,
          apiId: 5399,
          columns: [
            { label: "报警类型", prop: "alarmtype" },
            { label: "设备编号", prop: "number" },
            { label: "设备名称", prop: "name" },
            { label: "报警内容", prop: "remarks" },
            { label: "报警时间", prop: "alarmTime" },
          ],
        },
        personAlarm: {
          typeNum: 2,
          apiId: 5398,
          columns: [
            { label: "报警类型", prop: "alarmtype" },
            { label: "姓名", prop: "userName" },
            { label: "卡号", prop: "senderID" },
            { label: "部门", prop: "department" },
            { label: "职务", prop: "rank" },
            { label: "内容", prop: "remarks" },
            { label: "报警时间", prop: "alarmTime", width: 180 },
            { label: "当前位置", prop: "devicePosition", width: 200 },
            {
              label: "操作", prop: "edit", columnType: true, isEvent: true, width: 200,
              slots: [
                { soltName: "userinfo", data: "人员" },
                { soltName: "gj", data: "轨迹" },
              ],
            },
          ],
        },
      };
      const config = alarmConfig[title];
      if (!config) return;
      if (this.customBtn[0].btnName == "历史报警") {
        this.$router.push({
          name: "trajectoryQuery_app",
          query: { typeNum: config.typeNum },
        });
      } else {
        this.formItemList = [];
        this.tableColumn = config.columns;
        this.tableData = [];
        this.isQueryBtn = false;
        this.pageShow = false;
        this.getPolicy5399_5398_5410(config.apiId);
        this.customBtn[0].btnName = "历史报警";
      }
    },
    search(result) {
      result.type = this.openTitle;
      this.searchBarData = result;
      this.getPolicy5401(this.searchBarData);
    },
    tableClick(result) {
      this.row = result;
      this.operation = true;
    },
    operationClose() {
      this.operation = false;
    },
    operationClick(name) {
      let result = this.row;
      let obj = JSON.parse(JSON.stringify(result));
      const upResult = transitionKeyUp(obj);
      switch (name) {
        case "人员信息":
          this.$refs.userInfoPopup.show(result);
          this.operation = false;
          break;
        case "轨迹查询":
          let obj2 = upResult;
          obj2.typeNum = 0;
          this.$router.push({ name: "trajectoryQuery_app", query: obj2 });
          break;
        case "出勤统计":
          this.$router.push({
            name: "userInfo_app",
            query: { Username: upResult.UserName, workNum: upResult.WorkNumber, SenderID: upResult.SenderID },
          });
          break;
      }
    },
    tabPage(result) {
      this.searchBarData.Page = result.currentPage;
      this.searchBarData.size = result.pageSize;
      this.searchBarData.type = this.openTitle;
      this.getPolicy5401(this.searchBarData);
    },
    close() {
      this.formItemList = this.$options.data.call().formItemList;
      this.customBtn = this.$options.data.call().customBtn;
      this.isQueryBtn = false;
      this.pageShow = false;
    },
    touchend(callbackOrEvent) {
      if (typeof callbackOrEvent === 'function') {
        let X = this.endX - this.startX,
          Y = this.endY - this.startY;
        if (this.isMove) {
          if (X > 0 && Math.abs(X) > Math.abs(Y)) {
            callbackOrEvent('right');
          } else if (X < 0 && Math.abs(X) > Math.abs(Y)) {
            callbackOrEvent('left');
          }
          this.isMove = false;
        }
      } else {
        this.$options.methods.touchend.call(this, (direction) => {
          this.handlePagination(direction);
        });
      }
    },
    onTableBoxClick(value) {
      this.rowClick(false, value);
    },
  },
};
</script>

<style lang="scss" scoped>
.location-app {
  display: flex;
  flex-direction: column;
  background-color: var(--bgColor-app);

  .box1,
  .box2 {
    margin-bottom: 10px;
    background-color: var(--box-bgColor-app);
  }

  .table {
    margin-bottom: 10px;
    padding: 15px;
    background-color: var(--box-bgColor-app);
  }

  .box1 {
    box-sizing: border-box;
    height: auto;

    .alarm {
      background: var(--warn-bgColor);
      color: var(--warn-textColor);
      font-size: 12px;

      .alarm-number {
        margin-left: 20px;

        span {
          color: var(--warn-numberColor);
          font-size: 16px;
        }
      }

      ::v-deep .el-row {
        display: flex;
        align-items: center;
      }

      ::v-deep .alarm-icon {
        text-align: center;
      }

      ::v-deep .el-icon-circle-close {
        color: rgb(235 40 40 / 36%) !important;
        font-size: 25px;
      }
    }

    .downHoleNumber {
      margin: 10px 0;

      .el-row {
        .el-col-12 {
          margin-bottom: 10px;
          text-align: center;

          span {
            color: var(--personDownNum-numberColor);
          }

          p {
            margin: 0;
          }
        }
      }

      .el-divider--horizontal {
        display: block;
        width: 100%;
        height: 1px;
        margin: 15px 0 10px;
        background: var(--bgColor) !important;
      }
    }
  }

  .box2 {
    flex: 2;

    .box2-content {
      width: 90%;
      margin: auto;

      .title {
        margin: 15px 0;
        color: var(--textColor);

        .el-col {
          text-align: left;

          .unit {
            color: rgb(178 196 212 / 80%);
            font-size: 12px;
            text-align: right;
          }
        }
      }

      .btnList {
        color: var(--text-color);

        .active {
          background: var(--chart-btn-activeBgColor);
          color: var(--chart-btn-activeColor);
          font-weight: bold;
        }

        ul {
          display: flex;
          justify-content: space-around;
          margin: 0;
          padding: 0;
          border: 1px solid var(--chart-btn-borderColor);
          border-radius: 5px;
          background-color: var(--chart-btn-bgColor);
        }

        li {
          width: 60px;
          height: 30px;
          margin: 4px 0;
          padding: 0;
          border-radius: 5px;
          line-height: 30px;
          list-style: none;
          text-align: center;
        }
      }
    }

    .chartBox {
      width: 100%;
      height: 50vh;
      float: left;
    }

    .pageButton {
      position: relative;
      top: 5px;
      width: 100%;

      ::v-deep .el-icon-arrow-left,
      .el-icon-arrow-right {
        font-size: 25px;
      }
    }

    #next {
      position: relative;
      z-index: 999;
      top: -50;
      margin-right: 0.5rem;
      float: right;
      cursor: pointer;
    }

    #nev {
      position: relative;
      z-index: 999;
      width: 20px;
      height: 20px;
      margin-left: 0.5rem;
      float: left;
    }
  }

  ::v-deep .el-table .cell {
    padding-right: 0;
  }
}
</style>
