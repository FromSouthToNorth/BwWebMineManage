<template>
  <div>
    <Popup
      v-if="showPopup"
      :isShow="showPopup"
      :title="'井下人员信息'"
      :isQuery="false"
      :changeSearch="false"
      :isQueryBtn="false"
      :isResetBtn="false"
      :tableData="table.dataSource"
      :columnOptions="columns"
      :isShowFooter="false"
      :hasIndex="false"
      :width="'80%'"
      :paginationShow="true"
      :total="table.total"
      :appendToBody="true"
      :loading="table.loading"
      @columnClick="columnClick"
      @operationHandle="operationHandle"
      @tableChange="pageChange"
      @search="search"
      @close="close"
    />
    <trackInfoPopup ref="trackInfoPopup" :appendToBody="true"></trackInfoPopup>
    <userInfoPopup ref="userInfoPopup"></userInfoPopup>
  </div>
</template>

<script>
import Popup from "../trajectoryQuery.vue";
import PLMixin from "@/mixin/personnelLocationMixin";
import userInfoPopup from "@/components/personnelLocation/popups/userInfoPopup.vue";
import trackInfoPopup from "@/components/personnelLocation/popups/trackInfoPopup.vue";
import { getpolicy5281 } from "@/api/system/personnelLocation.js";
import { transitionKeyUp } from "@/views/personnel_location/downholeInfoJs";
export default {
  name: "downUserNumInfoPopup",
  components: {
    Popup,
    userInfoPopup,
    trackInfoPopup,
  },
  mixins: [PLMixin],
  props: {
    operation: Boolean,
  },
  data() {
    return {
      queryType: "",
      rowData: {},
      columns: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "姓名",
          prop: "UserName",
          isEvent: true,
        },
        {
          label: "工号",
          prop: "WorkNumber",
        },
        {
          label: "卡号",
          prop: "SenderID",
        },
        {
          label: "部门",
          prop: "Department",
        },
        {
          label: "职务",
          prop: "Rank",
        },
        {
          label: "工种",
          prop: "WorkType",
          width: 100,
        },
        {
          label: "所在区域",
          prop: "AreaName",
          width: 200,
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
        {
          label: "操作",
          prop: "edit",
          columnType: true,
          isEvent: true,
          width: 120,
          slots: [
            {
              soltName: "gj",
              data: "轨迹",
              isInMore: false,
            },
            {
              soltName: "ry",
              data: "人员",
              isInMore: true,
            },
            {
              soltName: "grcq",
              data: "个人出勤",
              isInMore: true,
            },
          ],
        },
      ],
    };
  },
  methods: {
    show(rowData, queryType) {
      this.rowData = rowData;
      this.queryType = queryType;
      this.showPopup = true;
      let param = {
        type: this.queryType,
        str: this.rowData.type,
      };
      this.table.queryParam = param;
      this.loadData(param);
    },
    close() {
      this.showPopup = false;
    },
    loadData(param) {
      this.table.loading = true;
      getpolicy5281(5281, param).then((res) => {
        let { data } = res;
        if (data.length != 0) {
          this.table.dataSource = data[0].data;
          this.table.total = data[0].total;
          this.table.loading = false;
        }
      });
    },
    /* 表格列点击事件 */
    columnClick(row, ClickContent, label) {
      console.log("columnClick", row, ClickContent, label);
      this.table.currentRow = row;
      switch (label) {
        case "姓名":
          this.$router.push({
            path: "/userinfo",
            query: {
              Username: row.UserName,
              workNum: row.WorkNumber,
              SenderID: row.SenderID,
            },
          });
          break;
        default:
          break;
      }
    },
    /* 列点击事件 */
    operationHandle(result, text) {
      this.row = result;
      switch (text) {
        case "人员":
          this.$refs.userInfoPopup.show(result);
          break;
        case "轨迹":
          let param = transitionKeyUp(result); //将对象属性首字母转为大写后传递
          this.$refs.trackInfoPopup.show(param);
          break;
        case "个人出勤":
          this.$router.push({
            path: "/userinfo",
            query: {
              Username: result.UserName,
              workNum: result.WorkNumber,
              SenderID: result.SenderID,
            },
          });
          this.userinfo = false;
          break;
        default:
          break;
      }
    },
    /* 井下人员信息查询事件 */
    search(result) {
      console.log("search", result);
      this.table.queryParam = result;
      if (this.customBtnState) {
        this.downUserType = result.type;
        this.loadData(result.type);
        // 设置第一列的描述为下拉选中的值
        this.downUserQueryClo[0].label = result.type;
      } else {
        this.loadData(result);
      }
    },
  },
};
</script>

<style></style>
