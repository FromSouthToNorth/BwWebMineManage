<template>
  <div class="devState">
    <div class="header">
      <headerApp
        :isScreen="true"
        :list="list"
        @screen="screen"
        @gotoPath="gotoPath"
      />
    </div>
    <div class="table">
      <my-table
        :tableData="tableData"
        :tableColumnOptions="tableCol"
        :paginationShow="true"
        :tableDataTotal="total"
        :small="true"
        :pagerCount="5"
        :size="size"
        :layOut="'total, prev, pager, next'"
        :loading="loading"
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
  getSelectData,
  getPolicy5303,
  getPolicy5400,
} from "@/api/system/personnelLocation";
export default {
  name: "devState",
  components: { headerApp, MyTable, myDrawer },
  data() {
    return {
      tableData: [],
      tableCol: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "区域",
          prop: "AreaName",
        },
        {
          label: "分站",
          prop: "Branch",
        },
        {
          label: "读卡器",
          prop: "DevicePosition",
          width: 130,
        },
        {
          label: "状态",
          prop: "state",
        },
      ],
      total: 0,
      loading: false,
      drawer: false,
      formItemList: [
        {
          type: "select",
          selectOptions: [],
          placeholder: "选择区域",
          param: "AreaName",
          label: "区域",
        },
        {
          type: "select",
          selectOptions: [
            { name: "正常", value: "正常" },
            { name: "异常", value: "异常" },
          ],
          placeholder: "选择状态",
          param: "State",
          label: "状态",
        },
        {
          type: "select",
          selectOptions: [],
          placeholder: "选择读卡器",
          param: "DevicePosition",
          label: "读卡器",
        },
      ],
      list: [{ name: "历史报警", path: "deviceHisState_app" }],
      param: {},
      size:10,
      _orientation: '',
    };
  },
  mounted() {
    this._orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    let size = this._orientation === 'portrait' ? this.size : 5;
    this.getDevStateData({Row:size});
  },
  methods: {
    screen() {
      this.getPolicy5308();
      this.drawer = true;
    },
    search(result) {
      this.param = result;
      this.param.Page = 1;
      this.Row = 20;
      this.drawer = false;
      this.$refs.myTable.updateCurrpage();
      this.getDevStateData(this.param);
    },
    handleClose() {
      this.drawer = false;
    },
    pageChange(result) {
      this.param.Page = result.currentPage;
      this.param.Row = result.pageSize;
      this.getDevStateData(this.param);
    },
    gotoPath(path) {
      this.$router.push({ name: path });
    },
    async getDevStateData(param) {
      this.loading = true;
      const { data } = await getPolicy5303(5303, param);
      this.tableData = [];
      if (data.length != 0) {
        this.tableData = data[0].data;
        this.total = Number(data[0].total);
      }
      this.loading = false;
    },
    async getSelectOptions() {
      const { data } = await getPolicy5400();
      if (data.length != 0) {
        this.formItemList.forEach((item, index) => {
          if (item.param == "AlarmType") {
            item.selectOptions = [];
            item.selectOptions = data[0].Alarmtype;
          }
        });
      }
    },
    async getPolicy5308() {
      const { data } = await getSelectData(5308);
      if (data[0].length != 0) {
        this.formItemList.forEach((item, index) => {
          switch (item.label) {
            case "部门":
              this.formItemList[index].selectOptions = [];
              data[0].Department.forEach((depart) => {
                this.formItemList[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
            case "工种":
              this.formItemList[index].selectOptions = [];
              data[0].WorkType.forEach((depart) => {
                this.formItemList[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
            case "位置":
            case "读卡器":
              this.formItemList[index].selectOptions = [];
              data[0].CardReader.forEach((depart) => {
                this.formItemList[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
            case "职务":
              this.formItemList[index].selectOptions = [];
              data[0].Rank.forEach((depart) => {
                this.formItemList[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
            case "区域":
              this.formItemList[index].selectOptions = [];
              data[0].region.forEach((depart) => {
                this.formItemList[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
          }
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
