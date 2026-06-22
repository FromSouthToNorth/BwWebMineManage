<template>
  <div class="track">
    <!-- 轨迹信息 -->
    <el-dialog
      v-model="showPopup"
      class="pl-track-dialog"
      :title="`${result.UserName} 轨迹信息`"
      :width="'70%'"
      :append-to-body="false"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :modal="true"
      @close="close"
    >
      <my-table
        :tableColumnOptions="trackColumn"
        :tableData="table.dataSource"
        :paginationShow="true"
        :tableDataTotal="table.total"
        :loading="table.loading"
        @tableUpdate="pageChange"
      />
    </el-dialog>
  </div>
</template>

<script>
import MyTable from "@/components/personnelLocation/tableComponent.vue";
import { getpolicy5268 } from "@/api/system/personnelLocation";
import PLMixin from "@/mixin/personnelLocationMixin";
export default {
  name: "trackInfoPopup",
  components: { MyTable },
  props: {
    appendToBody: Boolean,
  },
  mixins: [PLMixin],
  data() {
    return {
      result: {},
      trackColumn: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "位置",
          prop: "DevicePosition",
        },
        {
          label: "进入时间",
          prop: "EnterTime",
        },
        {
          label: "距离",
          prop: "Direction",
        },
        {
          label: "区域",
          prop: "AreaName",
        },
        {
          label: "离开时间",
          prop: "UpWellTime",
        },
        {
          label: "停留时间",
          prop: "StopTime",
        },
      ],
    };
  },
  methods: {
    show(result) {
      console.log("show", result);
      this.showPopup = true;
      this.result = result;
      this.table.queryParam = result;
      this.loadData(result);
    },
    close() {
      this.showPopup = false;
    },
    loadData(result) {
      this.table.loading = true;
      this.table.dataSource = [];
      getpolicy5268(5268, result)
        .then((res) => {
          let { data } = res;
          if (data.length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("轨迹数据查询失败:", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
  },
};
</script>

<style>
.pl-track-dialog {
  z-index: 9999;
  --el-dialog-bg-color: #061b46;
}
.pl-track-dialog .el-dialog__title {
  color: #bfbfbf;
}
.pl-track-dialog .el-dialog__body {
  padding: 10px;
}
</style>
