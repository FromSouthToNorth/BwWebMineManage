<template>
  <div class="personcount_app">
    <headerApp :isScreen="true" :list="[]" @screen="screen" />
    <div class="table">
      <my-table
        :tableData="tableData"
        :tableColumnOptions="tableCol"
        :paginationShow="true"
        :tableDataTotal="total"
        :size="Row"
        :small="true"
        :pagerCount="5"
        :layOut="'total, prev, pager, next'"
        :loading="loading"
        ref="myTable"
        :maxHeight="cliHeight"
        @tableUpdate="pageChange"
        @columnClick="columnClick"
      />
    </div>
    <myDrawer
      :drawer="drawer"
      :content="formItemList"
      :title="'条件筛选'"
      @handleClose="handleClose"
      @search="search"
    />
    <operation
      :visible.sync="operation"
      :list="operationList"
      @close="operationClose"
      @operationClick="operationClick"
    />
    <!-- 个人信息弹窗 -->
    <userInfoPopup ref="userInfoPopup"></userInfoPopup>
  </div>
</template>

<script>
import headerApp from "@/components/personnelLocation/header_app.vue";
import MyTable from "@/components/personnelLocation/tableComponent.vue";
import myDrawer from "@/components/personnelLocation/myDrawer.vue";
import operation from "@/components/personnelLocation/operationPopup.vue";
import userInfoPopup from "@/components/personnelLocation/popups/userInfoPopup.vue";
import { transitionKeyUp } from "@/views/personnel_location/downholeInfoJs";
import { formatDateTime } from '@/utils/util'
import {
  getSelectData,
  getDayCountData,
} from "@/api/system/personnelLocation.js";
export default {
  name: "personcount_app",
  components: { MyTable, myDrawer, headerApp, operation, userInfoPopup },
  data() {
    return {
      tableCol: [
        {
          label: "#",
          prop: "num",
          width: 50,
        },
        {
          label: "姓名",
          prop: "UserName",
          isEvent: true,
          width: 70,
        },
        {
          label: "工号",
          prop: "WorkNumber",
          width: 60,
        },
        {
          label: "卡号",
          prop: "SenderID",
          width: 50,
        },
        {
          label: "出勤时长",
          prop: "DownWellTime",
          width: 95,
        },
        {
          label: "部门",
          prop: "Department",
          width: 70,
        },
        {
          label: "职务",
          prop: "Rank",
          width: 50,
        },
        {
          label: "工种",
          prop: "WorkType",
          width: 70,
        },
        {
          label: "班次",
          prop: "ShiftId",
          width: 50,
        },
        {
          label: "下井时间",
          prop: "InTime",
          width: "135",
        },
        {
          label: "出井时间",
          prop: "UpTime",
          width: "135",
        },
      ],
      tableData: [],
      formItemList: [
        {
          type: "date",
          placeholder: "选择日期",
          param: "date",
          defaultSelect: formatDateTime(),
        },
        {
          type: "select",
          placeholder: "选择部门",
          selectOptions: [],
          param: "Department",
          defaultSelect: "",
        },
        {
          type: "select",
          placeholder: "选择职位",
          selectOptions: [],
          param: "Rank",
          defaultSelect: "",
        },
        {
          type: "select",
          placeholder: "选择工种",
          selectOptions: [],
          param: "WorkType",
          defaultSelect: "",
        },
        {
          type: "input",
          placeholder: "输入工号",
          param: "WorkNumber",
        },
        {
          type: "input",
          placeholder: "输入卡号",
          param: "SenderID",
        },
        {
          type: "input",
          placeholder: "输入姓名",
          param: "UserRealName",
        },
      ],
      total: 0,
      loading: false,
      drawer: false,
      queryList: [],
      Page: 1,
      Row: 15,
      param: {},
      operation: false,
      sync: false,
      operationList: ["人员信息", "出勤统计"],
      userinfo: {},
      cliHeight:
        document.documentElement.clientHeight ||
        document.body.clientHeight - 100,
    };
  },
  mounted() {
    let param = this.formItemList
      .filter((item) => item.defaultSelect)
      .reduce((acc, item) => {
        acc[item.param] = item.defaultSelect;
        return acc;
      }, {});
    param.Row = this.Row;
    this.getdata(param);
  },
  methods: {
    async getdata(param) {
      this.loading = true;
      this.tableData = [];
      const { data } = await getDayCountData(5301, param);
      if (data.length != 0) {
        this.tableData = data[0].data;
        this.total = data[0].total;
        this.loading = false;
      }
    },
    screen() {
      this.getSelect();
      this.drawer = true;
    },
    async getSelect() {
      const { data: select } = await getSelectData(5308);
      this.formItemList.forEach((item) => {
        switch (item.param) {
          case "Department":
            item.selectOptions = select[0]["Department"];
            break;
          case "Rank":
            item.selectOptions = select[0]["Rank"];
            break;
          case "WorkType":
            item.selectOptions = select[0]["WorkType"];
            break;
          default:
            break;
        }
      });
    },
    handleClose() {
      this.drawer = false;
    },
    search(result) {
      this.$refs.myTable.updateCurrpage();
      this.param = result;
      this.param.Page = this.Page;
      this.param.Row = this.Row;
      this.getdata(this.param);
      this.drawer = false;
    },
    pageChange(result) {
      this.param.Page = result.currentPage;
      this.param.Row = result.pageSize;
      this.getdata(this.param);
    },
    columnClick(result) {
      this.userinfo = result;
      this.operation = true;
    },
    operationClose() {
      this.operation = false;
    },
    operationClick(name) {
      let result = this.userinfo;
      let obj = JSON.parse(JSON.stringify(result));
      const upResult = transitionKeyUp(obj);
      switch (name) {
        case "人员信息":
          this.$refs.userInfoPopup.show(result);
          this.operation = false;
          break;
        case "出勤统计":
          this.$router.push({
            name: "userInfo_app",
            query: {
              Username: result.UserName,
              workNum: result.WorkNumber,
              SenderID: result.SenderID,
            },
          });
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
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
