<template>
  <div class="userinfo">
    <headerApp :isScreen="true" @gotoPath="gotoPath" @screen="screen" />
    <div class="info">
      <span style="font-size: 15px"
        >{{ params.Username }} {{ year }}年下井历史统计</span
      >
      <div
        class="barbox"
        :style="{
          width: '100%',
          height: `${_orientation == 'portrait' ? _cliHeight / 2 - 80 : 190}px`,
        }"
      >
        <div
          id="lineBar"
          :style="{
            width: '100%',
            height: `${_orientation == 'portrait' ? _cliHeight / 2 - 80 : 200}px`,
          }"
        ></div>
      </div>
      <div
        class="tablebox"
        :style="{
          width: '100%',
          height: `${_orientation == 'portrait' ? _cliHeight / 2 : 200}px`,
        }"
      >
        <div class="table">
          <span>{{ month }}月下井详情</span>
          <MyTable
            :tableData="tableData"
            :tableColumnOptions="columnOptions"
            :loading="loading"
            :selectionShow="false"
            :hasIndex="false"
            :paginationShow="false"
            :maxHeight="_cliHeight / 2"
            @columnClick="trackQuery"
          />
        </div>
      </div>
    </div>
    <div class="count"></div>
    <myDrawer
      :drawer="drawer"
      :content="yearSelected"
      :title="'条件筛选'"
      @handleClose="handleClose"
      @search="ChangeSearch"
    />
  </div>
</template>

<script>
import headerApp from "@/components/personnelLocation/header_app.vue";
import myDrawer from "@/components/personnelLocation/myDrawer.vue";
import MyTable from "@/components/personnelLocation/tableComponent.vue";
import baseQueryBarVue from "@/components/personnelLocation/baseQueryBar.vue";
import chartHeader from "@/components/personnelLocation/echartsHeader.vue";
import MyUserInfoTime from "@/components/personnelLocation/userInfoTimeCom.vue";
import MyUserInfoChart from "@/components/personnelLocation/userInfoChart.vue";
import trajectory from "@/components/personnelLocation/trajectoryQuery.vue";
import {
  getYear,
  GetinitLines,
  GetinitLine,
  transitionKeyUp,
} from "../downholeInfoJs";
import { getpolicy, getpolicy5268 } from "@/api/system/personnelLocation";
export default {
  components: {
    MyUserInfoTime,
    MyUserInfoChart,
    baseQueryBarVue,
    chartHeader,
    MyTable,
    trajectory,
    myDrawer,
    headerApp,
  },
  data() {
    return {
      years: [],
      year: "",
      month: "",
      loading: false,
      lineXData: [1, 2],
      lineYData: [10, 12],
      lineYDataTimeOut: [],
      lineYDataNormal: [],
      lineYDataAll: [],
      yearSelected: [
        {
          label: "年份",
          param: "year",
          type: "select",
          selectOptions: [],
          cssVariable: [
            {
              name: "inputWidth",
              value: "100px",
            },
          ],
          defaultSelect: "",
        },
      ],
      formItemList: [
        {
          type: "date",
          label: "日期",
          param: "date",
          defaultSelect: "",
        },
      ],
      tableData: [],
      columnOptions: [
        {
          label: "#",
          prop: "序号",
          width: 60,
        },
        {
          columnType: true,
          label: "轨迹查询",
          prop: "edit",
          width: 80,
          isEvent: true,
          slots: [
            {
              soltName: "trackQuery",
              data: "查看",
              isInMore: false,
              isEvent: true,
            },
          ],
        },
        {
          label: "日期",
          prop: "日期",
        },
        {
          label: "姓名",
          prop: "userName",
        },
        {
          label: "下井时间",
          prop: "downWellTime",
          width: 180,
        },
        {
          label: "上井时间",
          prop: "upWellTime",
          width: 180,
        },
        {
          label: "下井时长",
          prop: "下井时长",
        },
      ],
      params: {},
      chartVal: 0,
      timeout: 0,
      queryParam: {},
      drawer: false,
      _cliHeight: 0,
      _orientation: 'portrait',
    };
  },
  mounted() {
    this._cliHeight = document.documentElement.clientHeight || document.body.clientHeight;
    this._orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    this.param();
  },
  watch: {
    $route: "param",
  },
  methods: {
    gotoPath(path) {
      this.$router.push({
        path: path,
        query: {
          year: this.year,
          userName: this.params.Username,
          workNum: this.params.workNum,
          SenderID: this.params.SenderID,
        },
      });
    },
    init() {
      const data = getYear();
      this.years = data.years;
      this.year = data.year.toString();
      this.month = data.month;
      this.yearSelected[0].selectOptions = this.years;
      this.yearSelected[0].defaultSelect = this.year;
    },
    param() {
      this.init();
      const params = this.$route.query;
      this.params = params;
      this.axiosAll();
    },
    async getpolyc5286() {
      this.trackLoading = true;
      const { data } = await getpolicy(5286, this.params);
      this.tableData = [];
      if (data.length != 0) {
        this.tableData = data;
      }
      this.trackLoading = false;
    },
    getpolyc5282() {
      return getpolicy(5282, this.params).then(({ data }) => {
        this.lineXData = [];
        this.lineYDataAll = [];
        this.lineYDataNormal = [];
        this.lineYDataTimeOut = [];
        if (data.length != 0) {
          data.forEach((item) => {
            this.lineXData.push(
              item.month + "月" + (item.shiftId == "空" ? "" : item.shiftId)
            );
            this.lineYDataAll.push(item.all);
            this.lineYDataNormal.push(item.normal);
            this.lineYDataTimeOut.push(item.timeout);
          });
          GetinitLines(this, document.getElementById("lineBar"), "次", false);
        }
      });
    },
    screen() {
      this.drawer = true;
    },
    handleClose(done) {
      done();
      this.drawer = false;
    },
    ChangeSearch(result) {
      this.year = result.year;
      this.params.year = result.year;
      this.params.month = this.month;
      this.axiosAll();
      this.drawer = false;
    },
    async getTrajectDataList(param) {
      const { data } = await getpolicy5268(5268, param);
      if (data.length != 0) {
        this.trackTabData = data[0].data;
        this.trackTotal = Number(data[0].total);
      } else {
        this.trackTabData = [];
      }
    },
    trackQuery(result, track) {
      let obj = JSON.parse(JSON.stringify(result));
      const upResult = transitionKeyUp(obj);
      upResult.typeNum = 0;
      this.$router.push({
        name: "trajectoryQuery_app",
        query: upResult,
      });
    },
    pageChange(result) {
      this.queryParam.Page = result.currentPage;
      this.queryParam.Row = result.pageSize;
      this.getTrajectDataList(this.queryParam);
    },

    axiosAll() {
      Promise.all([
        this.getpolyc5286(),
        this.getpolyc5282(),
      ]);
    },
  },
};
</script>

<style lang="scss" scoped>
.userinfo {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--chart-bgColor);

  .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-around;
    padding-top: 10px;

    span {
      display: block;
      text-align: center;
    }
  }

  .tablebox {
    margin-top: 20px;

    .table {
      display: flex;
      flex-direction: column;
      justify-content: center;

      span {
        background-color: var(--header-btn-bgColor);
      }
    }
  }

  .count {
    flex: 1;
  }
}

::v-deep .el-dialog {
  border: 1px;
  border-radius: 10px;
  background: var(--user-popup-contentBgColor);
}

::v-deep .el-dialog__title {
  color: var(--text-color) !important;
}

::v-deep .el-dialog__body {
  padding: 10px;
}
</style>
