<template>
  <Popup
    :isShow="showPopup"
    :title="'区域撤离'"
    :isQuery="true"
    :changeSearch="false"
    :isQueryBtn="true"
    :isResetBtn="true"
    :tableData="table.dataSource"
    :loading="table.loading"
    :total="table.total"
    :columnOptions="columns"
    :customBtn="formItemList.customBtn"
    :formItemList="formItemList.item"
    :isShowFooter="false"
    :hasIndex="false"
    :width="'80%'"
    :paginationShow="false"
    :appendToBody="true"
    :selectionShow="true"
    :rowKey="'AreaId'"
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
  GetStrategyJsonData,
  bwPublicNodeRed,
} from "@/api/system/personnelLocation";
export default {
  name: "evacuateAreaPopup",
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
            placeholder: "请输入区域ID",
            param: "AreaId",
            label: "区域ID",
          },
          {
            type: "input",
            placeholder: "请输入区域名称",
            param: "AreaName",
            label: "区域名称",
          },
        ],
        customBtn: [
          {
            soltName: "batch",
            btnName: "批量撤离",
          },
          // {
          //   soltName: "query",
          //   btnName: "一键撤离",
          //   type: "buttonWarning",
          // },
        ],
      },
      columns: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "区域Id",
          prop: "AreaId",
          sort: true,
        },
        {
          label: "区域名称",
          prop: "AreaName",
          sort: true,
        },
        {
          label: "当前人数",
          prop: "Number",
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
            // {
            //   soltName: "callBack",
            //   data: "取消",
            //   isShow: true,
            //   isInMore: false,
            // },
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
      let formattedArray = Object.entries(paramObj).map(([key, val]) => ({
        name: key,
        value: val,
      }));
      this.table.loading = true;
      GetStrategyJsonData(6943, formattedArray)
        .then((res) => {
          let { data } = res;
          this.table.dataSource = [];
          if (data[0].length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("区域撤离数据查询失败", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
    /* 自定义按钮事件 */
    soltHandel(row, text, type) {
      console.log("soltHandel", row, text, type);
      let params = {};
      if (this.table.selectedRows.length == 0) {
        this.$message.error(`至少勾选一条数据！`);
        return;
      }
      let ids = this.table.selectedRows.map((obj) => obj.AreaId);
      params = {
        api_id: "DQY_XF_HJCL",
        data: {
          AreaId: ids,
        },
      };
      this.IssueInstructions_interface(params);
    },
    /* 操作列点击事件 */
    operationHandle(row, text) {
      console.log("撤离", row);
      let params = {
        api_id: "DQY_XF_HJCL",
        data: {
          AreaId: [row.AreaId],
        },
      };
      this.IssueInstructions_interface(params);
    },
    /* 指令下发，调用规则引擎接口 */
    IssueInstructions_interface(params) {
      console.log("IssueInstructions_interface", params);

      this.$confirm("点击确认后将执行指令下发操作，是否继续？", "提示").then(
        (_) => {
          this.table.loading = true;
          bwPublicNodeRed(params)
            .then((res) => {
              if (res.data.code == 100) {
                this.$message.success("指令下发成功！");
              } else {
                this.$message.error(`指令下发失败！${res.data.mesg}`);
              }
            })
            .catch((err) => {
              this.$message.error(`指令下发失败！${err}`);
            })
            .finally(() => {
              this.table.loading = false;
            });
        }
      );
    },
  },
};
</script>

<style></style>
