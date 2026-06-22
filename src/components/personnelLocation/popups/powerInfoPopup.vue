<template>
  <!-- 电源信息 -->
  <Popup
    :isShow="showPopup"
    :title="'实时电源信息查询'"
    :isQuery="true"
    :changeSearch="false"
    :isQueryBtn="true"
    :isResetBtn="true"
    :tableData="table.dataSource"
    :columnOptions="columns"
    :formItemList="formItemList.item"
    :isShowFooter="false"
    :hasIndex="false"
    :width="'80%'"
    :paginationShow="true"
    :total="table.total"
    :appendToBody="true"
    :loading="table.loading"
    @tableChange="pageChange"
    @search="search"
    @close="close"
  />
</template>

<script>
import Popup from "../trajectoryQuery.vue";
import PLMixin from "@/mixin/personnelLocationMixin";
import { getPolicy6726 } from "@/api/system/personnelLocation";
export default {
  name: "powerInfoPopup",
  components: {
    Popup,
  },
  mixins: [PLMixin],
  data() {
    return {
      formItemList: {
        item: [
          {
            type: "input",
            param: "ShortDevLabel",
            label: "设备编号",
            placeholder: "请输入设备编号",
            defaultSelect: "",
          },
        ],
      },
      columns: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "设备编号",
          prop: "ShortDevLabel",
        },
        {
          label: "设备名称",
          prop: "AddrName",
          width: 180,
        },
        {
          label: "类型",
          prop: "TypeName",
          width: 180,
          sort: true,
        },
        {
          label: "监测时间",
          prop: "VTime",
          width: 180,
        },
        {
          label: "电源电压",
          prop: "InV",
          sort: true,
        },
        {
          label: "电池电压",
          prop: "OutV",
          sort: true,
        },
        {
          label: "充电电流",
          prop: "InI",
          sort: true,
        },
        {
          label: "放电电流",
          prop: "OutI",
          sort: true,
        },
        {
          label: "温度",
          prop: "TempV",
          sort: true,
        },
        {
          label: "电池电量",
          prop: "InEQ",
          sort: true,
        },
        {
          label: "剩余容量",
          prop: "OutEQ",
          sort: true,
        },
        {
          label: "剩余电量",
          prop: "SurEQ",
          sort: true,
        },
      ],
    };
  },
  methods: {
    show() {
      this.showPopup = true;
      this.loadData();
    },
    close() {
      this.showPopup = false;
    },
    loadData(param) {
      let paramObj = this.addDefaultParam(param);
      this.table.loading = true;
      getPolicy6726(paramObj)
        .then((res) => {
          let { data } = res;
          this.table.dataSource = [];
          if (data.length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("查询电源信息数据失败", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
  },
};
</script>

<style></style>
