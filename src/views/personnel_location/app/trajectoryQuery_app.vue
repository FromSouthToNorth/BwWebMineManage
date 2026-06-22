<template>
  <div class="trajectoryquery">
    <div class="header">
      <headerApp :isScreen="isScreen" :list="[]" @screen="screen" />
    </div>
    <div v-if="param.typeNum == 0" class="username">
      <span>{{ param.UserName }} </span>轨迹信息
    </div>
    <div class="table">
      <MyTable
        :tableData="tableData"
        :tableColumnOptions="tableColumn"
        :tableDataTotal="total"
        :paginationShow="true"
        :loading="loading"
        :small="true"
        :size="param.Row"
        :layOut="'total,prev,pager,next'"
        :maxHeight="cliHeight"
        ref="myTable"
        @tableUpdate="pageChange"
      />
    </div>
    <myDrawer
      :drawer="drawer"
      :content="formItemList"
      :title="'条件筛选'"
      @handleClose="handleClose"
      @search="search"
    />
  </div>
</template>

<script>
import headerApp from "@/components/personnelLocation/header_app.vue";
import MyTable from "@/components/personnelLocation/tableComponent.vue";
import myDrawer from "@/components/personnelLocation/myDrawer.vue";
import {
  getpolicy5268,
  getPolicy5400,
  getPolicy5401,
} from "@/api/system/personnelLocation";
import {
  pageFieldConvert,
} from "@/views/personnel_location/downholeInfoJs";
import { formatDateTime, getRecentDayRange } from '@/utils/util'
export default {
  name: "trajectoryquery_app",
  components: { MyTable, headerApp, myDrawer },
  data() {
    return {
      isScreen: true,
      tableData: [],
      tableColumn: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "位置",
          prop: "DevicePosition",
          width: 180,
        },
        {
          label: "进入时间",
          prop: "EnterTime",
          width: 150,
        },
        {
          label: "距离",
          prop: "Direction",
        },
        {
          label: "离开时间",
          prop: "UpWellTime",
          width: 150,
        },
        {
          label: "停留时间",
          prop: "StopTime",
        },
      ],

      total: 0,
      formItemList: [
        {
          type: "date",
          placeholder: "选择日期",
          param: "date",
          label: "日期",
          defaultSelect: "",
        },
      ],
      param: {
        Page: 1,
        Row: 15,
      },
      loading: false,
      drawer: false,
      day: "",
      initDate: {},
      cliHeight:
        document.documentElement.clientHeight ||
        document.body.clientHeight - 100,
    };
  },
  mounted() {
    this.param = { ...this.param, ...this.$route.query };
    let type = Number(this.param.typeNum);
    const [initStart, initEnd] = getRecentDayRange(7);
    this.initDate = { StartTime: initStart, EndTime: initEnd };

    /* 设置默认时间 */
    this.formItemList[0].defaultSelect = this.param.day
      ? formatDateTime(this.param.day, "YYYY-MM-DD")
      : formatDateTime(new Date(), "YYYY-MM-DD");
    /* type=0:轨迹信息，1：设备历史报警，2：人员历史报警 */
    switch (type) {
      case 0:
        this.isScreen = false;
        this.GetTrajectoryData(this.param);
        return;
      case 1:
        this.formItemList = [
          {
            type: "datetime",
            param: "StartTime",
            label: "开始时间",
            defaultSelect: new Date(this.initDate.StartTime),
          },
          {
            type: "datetime",
            param: "EndTime",
            label: "结束时间",
            defaultSelect: new Date(this.initDate.EndTime),
          },
          {
            type: "select",
            param: "AlarmType",
            selectOptions: [],
            label: "报警类型",
          },
          {
            type: "input",
            param: "Remarks",
            placeholder: "模糊查询",
            label: "报警内容",
          },
          {
            type: "input",
            param: "Name",
            placeholder: "模糊查询",
            label: "设备名称",
          },
        ];
        this.tableColumn = [
          {
            label: "#",
            prop: "num",
          },
          {
            label: "报警类型",
            prop: "AlarmType",
          },
          {
            label: "设备编号",
            prop: "number",
          },
          {
            label: "设备名称",
            prop: "name",
          },
          {
            label: "报警内容",
            prop: "Remarks",
          },
          {
            label: "报警时间",
            prop: "StartTime",
          },
          {
            label: "结束时间",
            prop: "EndTime",
          },
        ];
        this.param.type = "设备报警";
        break;
      case 2:
        this.formItemList = [
          {
            type: "datetime",
            param: "StartTime",
            label: "开始时间",
            defaultSelect: new Date(this.initDate.StartTime),
          },
          {
            type: "datetime",
            param: "EndTime",
            label: "结束时间",
            defaultSelect: new Date(this.initDate.EndTime),
          },
          {
            type: "select",
            param: "AlarmType",
            selectOptions: [],
            label: "报警类型",
          },
          {
            type: "input",
            param: "Remarks",
            placeholder: "模糊查询",
            label: "报警内容",
          },
          {
            type: "input",
            param: "WorkNumber",
            placeholder: "模糊查询",
            label: "工号",
          },
          {
            type: "input",
            param: "Number",
            placeholder: "模糊查询",
            label: "卡号",
          },
          {
            type: "input",
            param: "Name",
            placeholder: "模糊查询",
            label: "姓名",
          },
        ];
        this.tableColumn = [
          {
            label: "#",
            prop: "num",
          },
          {
            label: "报警类型",
            prop: "AlarmType",
          },
          {
            label: "工号",
            prop: "WorkNumber",
          },
          {
            label: "姓名",
            prop: "userName",
          },
          {
            label: "卡号",
            prop: "SenderID",
          },
          {
            label: "报警内容",
            prop: "Remarks",
          },
          {
            label: "报警时间",
            prop: "StartTime",
          },
          {
            label: "结束时间",
            prop: "EndTime",
          },
        ];
        this.param.type = "人员报警";
        break;
    }

    /* 绑定下拉数据 */
    this.formItemList.forEach((item, index) => {
      if (item.param == "AlarmType") {
        this.getSelectOptions(index);
      }
    });
    this.param.StartTime = this.initDate.StartTime;
    this.param.EndTime = this.initDate.EndTime;
    this.GetDeviceAndPersonData(this.param);
  },
  methods: {
    async GetTrajectoryData(param) {
      this.loading = true;
      const { data } = await getpolicy5268(5268, param);
      if (data.length != 0) {
        this.tableData = data[0].data;
        this.total = Number(data[0].total);
      }
      this.loading = false;
    },
    async GetDeviceAndPersonData() {
      this.loading = true;
      const { data } = await getPolicy5401(5401, this.param);
      this.tableData = [];
      if (data.length != 0) {
        this.tableData = data[0].data;
        this.total = Number(data[0].total);
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
    screen() {
      this.drawer = true;
    },
    handleClose() {
      this.drawer = false;
    },
    search(result) {
      this.$refs.myTable.updateCurrpage();
      switch (Number(this.param.typeNum)) {
        case 0:
          this.GetTrajectoryData(result);
          break;
        case 1:
        case 2:
          this.param = { ...this.param, ...result };
          this.GetDeviceAndPersonData(this.param);
          break;
      }
      this.drawer = false;
    },
    pageChange(result) {
      this.param = { ...this.param, ...pageFieldConvert(result) };
      switch (Number(this.param.typeNum)) {
        case 0:
          this.GetTrajectoryData(this.param);
          break;
        case 1:
        case 2:
          this.GetDeviceAndPersonData(this.param);
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.trajectoryquery {
  .username {
    background-color: var(--chart-bgColor);
    text-align: center;

    span {
      color: var(--highlight-color);
    }
  }
}
</style>
