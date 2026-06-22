<template>
  <div class="personquery_app">
    <div class="querybar">
      <ul>
        <li
          v-for="(item, index) in tabText"
          :key="index"
          @click="onTabHandel(index)"
          :class="active == index ? 'active' : ''"
        >
          {{ item }}
        </li>
      </ul>
      <div class="img" @click="screen">
        <img :src="imgUrl" alt="" />
      </div>
    </div>
    <!-- 查询栏 -->
    <div v-if="active == 1">
      <querybar
        :formItemList="defItemList"
        :query="true"
        :reSet="true"
        @search="search"
      />
    </div>
    <div class="table">
      <myTable
        :tableData="detailsData"
        :tableColumnOptions="detailsCloumn"
        :paginationShow="showPage"
        :tableDataTotal="detailsTotal"
        :loading="loading"
        :hasIndex="isCustom"
        :size="Row"
        :small="true"
        :pagerCount="5"
        :layOut="'total, prev, pager, next'"
        :maxHeight="clientHeight"
        ref="myTable"
        @tableUpdate="tableUpdate"
        @columnClick="columnClick"
        :key="clientHeight"
      />
    </div>
    <myDrawer
      :drawer="drawer"
      :content="formItemList"
      :title="'条件筛选'"
      @handleClose="handleClose"
      @search="search"
    />
    <trajectory
      :isShow.sync="numPopup"
      :title="'井下人员信息'"
      :isQuery="false"
      :isQueryBtn="false"
      :isResetBtn="false"
      :tableData="personNumData"
      :columnOptions="personNumCol"
      :isShowFooter="false"
      :hasIndex="false"
      :width="'100%'"
      :paginationShow="true"
      :small="true"
      :size="Row"
      :pagerCount="5"
      :layOut="'total, prev, pager, next'"
      :total="total"
      :loading="numloading"
      @columnClick="columnClick"
      @tableChange="numInfoPageChange"
    />
  </div>
</template>

<script>
import trajectory from "@/components/personnelLocation/trajectoryQuery.vue";
import querybar from "@/components/personnelLocation/baseQueryBar.vue";
import myTable from "@/components/personnelLocation/tableComponent.vue";
import myDrawer from "@/components/personnelLocation/myDrawer.vue";
import {
  getIndexData,
  getPolicy5280,
  getSelectData,
  getpolicy5281,
} from "@/api/system/personnelLocation.js";
export default {
  name: "personquery_app",
  components: { querybar, myTable, myDrawer, trajectory },
  data() {
    return {
      detailsData: [],
      detailsCloumn: [
        {
          label: "部门",
          prop: "type",
        },
        {
          label: "人数",
          prop: "userNum",
          isEvent: true,
        },
      ],
      formItemList: [
        {
          type: "select",
          selectOptions: [
            {
              name: "区域",
              value: "区域",
            },
            {
              name: "读卡器",
              value: "读卡器",
            },
            {
              name: "部门",
              value: "部门",
            },
            {
              name: "职务",
              value: "职务",
            },
            {
              name: "工种",
              value: "工种",
            },
          ],
          placeholder: "选择类型",
          param: "type",
          label: "类型",
          defaultSelect: "部门",
        },
      ],
      defItemList: [],
      detailsTotal: 0,
      type: "部门",
      loading: false,
      query: false,
      changeSearch: true,
      customBtn: [
        {
          soltName: "query",
          btnName: "自定义查询",
        },
      ],
      isCustom: true,
      drawer: false,
      showPage: false,
      Page: 1,
      Row: 10,
      param: {},
      clientHeight: 0,
      personNumData: [],
      personNumCol: [
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
          label: "当前位置",
          prop: "DevicePosition",
          width: 180,
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
      numPopup: false,
      total: 0,
      numloading: false,
      str: "",
      active: 1,
      tabText: ["分类查询", "自定义查询"],
      imgUrl: '',
    };
  },
  mounted() {
    this.onTabHandel(1);
    this.clientHeight = (document.documentElement.clientHeight || document.body.clientHeight) - 80;
    this.imgUrl = new URL('@/assets/icon/full.png', import.meta.url).href;
  },
  methods: {
    async getpolicy5255() {
      this.tableData = [];
      this.loading = true;
      const { data } = await getIndexData(5255, this.type);
      if (data.length != 0) {
        this.detailsData = data;
      }
      this.loading = false;
    },
    async getCustomData(param) {
      this.loading = true;
      const { data } = await getPolicy5280(5280, param);
      this.detailsData = [];
      if (data[0].length != 0) {
        this.detailsData = data[0].data;
        this.detailsTotal = Number(data[0].total);
      }
      this.Page = 1;
      this.loading = false;
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
      this.defItemList.length = 0;
      this.formItemList.forEach((item) => {
        if (
          item.label == "部门" ||
          item.label == "职务" ||
          item.label == "姓名"
        ) {
          item.width = "100%";
          this.defItemList.push(item);
        }
      });
    },

    async userNumClick(param) {
      this.numloading = true;
      const { data } = await getpolicy5281(5281, param);
      this.personNumData = [];
      if (data[0].length != 0) {
        this.personNumData = data[0].data;
        this.total = Number(data[0].total);
      }
      this.numloading = false;
    },
    onTabHandel(index) {
      this.active = index;
      switch (index) {
        case 0:
          this.detailsCloumn = [
            {
              label: "部门",
              prop: "type",
            },
            {
              label: "人数",
              prop: "userNum",
              isEvent: true,
            },
          ];
          this.formItemList = this.$options.data.call().formItemList;
          this.type = "部门";
          this.query = false;
          this.changeSearch = true;
          this.isCustom = true;
          this.showPage = false;
          this.getpolicy5255(this.type);
          break;
        case 1:
          this.detailsCloumn = [
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
              label: "工号",
              prop: "WorkNumber",
            },
            {
              label: "当前位置",
              prop: "DevicePosition",
            },
            {
              label: "距离",
              prop: "Direction",
            },
            {
              label: "下井时间",
              prop: "DownWellTime",
              width: 150,
            },
            {
              label: "班次",
              prop: "Shift",
            },
          ];
          this.formItemList = [
            {
              type: "select",
              selectOptions: [],
              placeholder: "选择部门",
              param: "department",
              label: "部门",
            },
            {
              type: "select",
              selectOptions: [],
              placeholder: "选择工种",
              param: "workType",
              label: "工种",
            },
            {
              type: "select",
              selectOptions: [],
              placeholder: "选择位置",
              param: "devicePosition",
              label: "位置",
            },
            {
              type: "select",
              selectOptions: [],
              placeholder: "选择职务",
              param: "rank",
              label: "职务",
            },
            {
              type: "select",
              selectOptions: [],
              placeholder: "选择区域",
              param: "areaName",
              label: "区域",
            },
            {
              type: "input",
              placeholder: "输入班次",
              param: "shift",
              label: "班次",
            },
            {
              type: "input",
              placeholder: "输入姓名",
              param: "userName",
              label: "姓名",
            },
            {
              type: "input",
              placeholder: "输入工号",
              param: "workNumber",
              label: "工号",
            },
            {
              type: "input",
              placeholder: "输入卡号",
              param: "SenderID",
              label: "卡号",
            },
          ];
          this.getCustomData({ Row: this.Row });
          this.query = true;
          this.changeSearch = false;
          this.isCustom = false;
          this.showPage = true;
          this.getPolicy5308();
          break;
      }
    },
    search(result) {
      this.param = result;
      if (this.active == 0) {
        this.type = result.type;
        this.getpolicy5255(this.param.type);
      } else {
        result.Row = this.Row;
        this.getCustomData(result);
      }
      this.$refs.myTable.updateCurrpage();
      this.drawer = false;
    },
    tableUpdate(result) {
      this.param.Page = result.currentPage;
      this.param.Row = result.pageSize;
      this.getCustomData(this.param);
    },
    screen() {
      if (this.active == 1) {
        this.getPolicy5308();
      }
      this.drawer = true;
    },
    handleClose(done) {
      done();
      this.drawer = false;
    },
    columnClick(result, text, label) {
      switch (label) {
        case "人数":
          this.str = result.type;
          let param = {
            type: this.type,
            str: this.str,
            Page: this.Page,
            Row: this.Row,
          };
          this.userNumClick(param);
          this.numPopup = true;
          break;
        case "姓名":
          this.$router.push({
            path: "userInfo_app",
            query: {
              Username: result.UserName,
              workNum: result.WorkNumber,
              SenderID: result.SenderID,
            },
          });
          break;
      }
    },
    numInfoPageChange(result) {
      let param = {
        type: this.type,
        str: this.str,
        Page: result.currentPage,
        Row: result.pageSize,
      };
      this.userNumClick(param);
    },
  },
};
</script>

<style lang="scss" scoped>
.personquery_app {
  .querybar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    background-color: var(--tab-bgColor);
    color: var(--tab-textColor);

    .active {
      color: var(--highlight-color);
      font-family: var(--font-family);
      font-weight: bold;
    }

    ul,
    li {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    ul {
      display: flex;
      border-radius: 4px;
      font-size: 13px;

      li {
        padding: 10px;
        border: 1px;
        border-radius: 4px;
      }
    }

    ::v-deep .dialog-search {
      width: 100%;
      margin: 0;
    }

    ::v-deep .el-form.demo-form-inline.el-form--inline {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .img {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      margin-right: 10px;
      border: 1px;
      border-radius: 4px;
      background-color: var(--header-btn-bgColor);
    }
  }
}
</style>
