<template>
  <Popup
    :isShow="showPopup"
    :title="'设备撤离'"
    :isQuery="true"
    :changeSearch="false"
    :isQueryBtn="true"
    :isResetBtn="true"
    :tableData="table.dataSource"
    :loading="table.loading"
    :columnOptions="columns"
    :formItemList="formItemList.item"
    :customBtn="formItemList.customBtn"
    :isShowFooter="false"
    :hasIndex="false"
    :width="'80%'"
    :paginationShow="true"
    :total="table.total"
    :appendToBody="true"
    :selectionShow="true"
    :rowKey="'DeviceId'"
    @operationHandle="operationHandle"
    @soltHandel="soltHandel"
    @search="search"
    @selectionChange="selectionChange"
    @tableChange="pageChange"
    @close="close"
  />
</template>

<script>
import Popup from "../trajectoryQuery.vue";
import PLMixin from "@/mixin/personnelLocationMixin";
import {
  getPolicy6748,
  ExecPolicy,
  bwPublicNodeRed,
} from "@/api/system/personnelLocation";
export default {
  name: "evacuateDevicePopup",
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
            placeholder: "设备编号",
            param: "DeviceId",
            label: "设备编号",
          },
        ],
        customBtn: [
          {
            soltName: "batch",
            btnName: "批量/全部撤离",
          },
          {
            soltName: "batch",
            btnName: "批量/全部取消",
          },
        ],
      },
      columns: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "设备编码",
          prop: "DeviceId",
          sort: true,
        },
        {
          label: "区域",
          prop: "AreaName",
          sort: true,
        },
        {
          label: "设备描述",
          prop: "DevicePosition",
          sort: true,
        },
        {
          label: "操作",
          prop: "edit",
          columnType: true,
          isEvent: true,
          width: 150,
          slots: [
            {
              soltName: "cl",
              data: "撤离",
              isShow: true,
              isInMore: false,
            },
            {
              soltName: "qx",
              data: "取消",
              isShow: true,
              isInMore: false,
            },
          ],
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
      getPolicy6748(paramObj)
        .then((res) => {
          let { data } = res;
          this.table.dataSource = [];
          if (data[0].length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("设备撤离数据查询失败", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
    /* 设备撤离 全部撤离 */
    soltHandel(result, text) {
      console.log("设备撤离,全部撤离", result);
      let ids = [];
      const rows = this.table.selectedRows;
      if (rows.length != 0) {
        ids = rows.map((item) => {
          return item.DeviceId;
        });
      }
      let str = "DSB_XF_HJCL";
      switch (text) {
        case "批量/全部取消":
          str = "DSB_XF_HJCL_QX";
          break;
        default:
          break;
      }
      this.exec6766(ids, str);
    },
    /* 设备撤离 撤离/取消 */
    operationHandle(row, text) {
      console.log("设备撤离,撤离/取消");
      //默认为撤离地址
      let str = "DSB_XF_HJCL";
      let id = [row.DeviceId];
      if (text == "取消") {
        str = "DSB_XF_HJCL_QX";
      }
      this.exec6766(id, str);
    },
    /* 指令下发，调用策略 */
    exec6766(IDs, InterFace) {
      let param = [
        {
          name: "IDs",
          value: IDs,
        },
        {
          name: "InterFace",
          value: InterFace,
        },
      ];
      console.log("exec6766", param);

      this.$confirm("点击确认后将执行指令下发操作，是否继续？", "提示")
        .then((_) => {
          this.table.loading = true;
          ExecPolicy(6766, param)
            .then((res) => {
              if (res.data) {
                this.$message.success("指令下发成功！");
              }
            })
            .catch((res) => {
              this.$message.success("指令下发失败！" + res.mesg);
            })
            .finally(() => {
              this.table.loading = false;
            });
        })
        .catch((_) => {});
    },
  },
};
</script>

<style></style>
