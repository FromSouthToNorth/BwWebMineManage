<template>
  <div class="turnOutInfo">
    <headerApp :isScreen="false" :list="[]" />
    <div class="title">
      <span
        >{{ params.day }}日 {{ params.name }} {{ params.type }}出勤信息</span
      >
    </div>
    <div class="table">
      <myTable
        :tableData="tableData"
        :tableColumnOptions="tableCloumn"
        :paginationShow="false"
        :hasIndex="true"
        :selectionShow="false"
        :loading="loading"
        :small="true"
        :pagerCount="5"
        :layOut="'total, prev, pager, next'"
        :maxHeight="cliHeight"
        ref="myTable"
        @columnClick="tableClick"
      />
    </div>
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
import headerApp from "@/components/personnelLocation/header_app.vue";
import operation from "@/components/personnelLocation/operationPopup.vue";
import userInfoPopup from "@/components/personnelLocation/popups/userInfoPopup.vue";
import myTable from "@/components/personnelLocation/tableComponent.vue";
import myheader from "@/components/personnelLocation/header.vue";
import {
  getpolicy5266,
} from "@/api/system/personnelLocation";
import { transitionKeyUp } from "@/views/personnel_location/downholeInfoJs";
export default {
  name: "turnOutInfo_app",
  components: {
    myheader,
    myTable,
    userInfoPopup,
    headerApp,
    operation,
  },
  data() {
    return {
      tableData: [],
      tableCloumn: [
        {
          label: "姓名",
          prop: "userName",
          isEvent: true,
        },
        {
          label: "卡号",
          prop: "senderID",
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
          color: "red",
        },
        {
          label: "班次",
          prop: "shift",
        },
      ],
      params: {},
      loading: false,
      sync: false,
      row: {},
      operation: false,
      operationList: ["人员信息", "轨迹查询", "出勤统计"],
      cliHeight:
        document.documentElement.clientHeight ||
        document.body.clientHeight - 100,
    };
  },

  mounted() {
    let obj = this.$route.params;
    let param = {
      month: `${obj.year}${obj.month < 10 ? "0" + obj.month : obj.month}`,
      day: `${obj.year}-${obj.month < 10 ? "0" + obj.month : obj.month}-${
        obj.day
      }`,
      type: obj.type,
      name: obj.name,
    };
    this.params = param;
    this.getdata();
  },
  methods: {
    operationClose() {
      this.operation = false;
    },
    operationClick(name) {
      let obj = this.row;
      let copyObj = JSON.parse(JSON.stringify(obj));
      const result = transitionKeyUp(copyObj);
      switch (name) {
        case "人员信息":
          this.$refs.userInfoPopup.show(result);
          this.operation = false;
          break;
        case "轨迹查询":
          let obj2 = result;
          obj2.typeNum = 0;
          this.$router.push({
            name: "trajectoryQuery_app",
            query: obj2,
          });
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
      this.operation = false;
    },
    async getdata() {
      this.loading = true;
      const { data } = await getpolicy5266(5266, this.params);
      if (data.length != 0) {
        this.tableData = data;
      }
      this.loading = false;
    },
    tableClick(result, text) {
      this.row = result;
      this.operation = true;
    },
    close() {
      this.row = {};
    },
  },
};
</script>

<style lang="scss" scoped>
.turnOutInfo {
  width: 100%;
  height: 100%;

  .title {
    margin-bottom: 10px;
    text-align: center;
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
}
</style>
