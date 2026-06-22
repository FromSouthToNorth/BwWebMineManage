<template>
  <!-- 呼叫回电 -->
  <Popup
    :isShow="showPopup"
    :title="'呼叫回电'"
    :isQuery="true"
    :changeSearch="false"
    :isQueryBtn="true"
    :isResetBtn="true"
    :tableData="table.dataSource"
    :total="table.total"
    :loading="table.loading"
    :columnOptions="columns"
    :formItemList="formItemList.item"
    :isShowFooter="false"
    :hasIndex="false"
    :width="'80%'"
    :paginationShow="true"
    :appendToBody="true"
    :selectionShow="true"
    :rowKey="'SenderID'"
    :customBtn="formItemList.customBtn"
    @tableChange="pageChange"
    @search="search"
    @operationHandle="operationHandle"
    @soltHandel="callBackSolt"
    @selectionChange="selectionChange"
    @close="close"
  />
</template>

<script>
import Popup from "../trajectoryQuery.vue";
import PLMixin from "@/mixin/personnelLocationMixin";
import {
  getPolicy5280,
  ExecPolicy,
  bwPublicNodeRed,
} from "@/api/system/personnelLocation";
export default {
  name: "callBackPopup",
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
            param: "senderID",
            label: "卡号",
          },
        ],
        customBtn: [
          {
            soltName: "query",
            btnName: "呼叫全部",
          },
        ],
      },
      columns: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "姓名",
          prop: "UserName",
          isEvent: false,
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
          label: "所在区域",
          prop: "AreaName",
        },
        {
          label: "当前位置",
          prop: "DevicePosition",
          width: 180,
        },
        {
          label: "操作",
          prop: "edit",
          columnType: true,
          isEvent: true,
          width: 150,
          slots: [
            {
              soltName: "callBack",
              data: "呼叫回电",
              color: "var(--highlight-color)",
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
      getPolicy5280(5280, paramObj)
        .then((res) => {
          let { data } = res;
          this.table.dataSource = [];
          if (data[0].length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("呼叫回电数据查询失败", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
    /* 呼叫回电操作列点击事件 */
    operationHandle(row) {
      this.exec6766([row.SenderID], "DRY_XF_HJHD");
    },
    /* 呼叫全部 */
    callBackSolt(result) {
      this.dialogVisible = true;
      this.exec6766([], "DRY_XF_HJHD");
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
