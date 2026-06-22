<template>
  <Popup
    :isShow="showPopup"
    :title="'人员撤离'"
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
    :rowKey="'SenderId'"
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
  name: "evacuatePersonnelPopup",
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
            placeholder: "请输入姓名",
            param: "Uname",
            label: "姓名",
          },
          {
            type: "input",
            placeholder: "请输入卡号",
            param: "SenderId",
            label: "卡号",
          },
          {
            type: "input",
            placeholder: "请输入部门",
            param: "Department",
            label: "部门",
          },
          {
            type: "input",
            placeholder: "请输入设备ID",
            param: "DeviceId",
            label: "设备ID",
          },
        ],
        customBtn: [
          {
            soltName: "batch",
            btnName: "批量撤离",
          },
          {
            soltName: "query",
            btnName: "一键全矿撤离",
            type: "buttonWarning",
          },
        ],
      },
      columns: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "卡号",
          prop: "SenderId",
          sort: true,
        },
        {
          label: "姓名",
          prop: "Uname",
          sort: true,
        },
        {
          label: "部门",
          prop: "Department",
          sort: true,
        },
        {
          label: "工种",
          prop: "WorkType",
          sort: true,
        },
        {
          label: "设备ID",
          prop: "DeviceId",
          sort: true,
        },
        {
          label: "设备位名称",
          prop: "DevicePosition",
          sort: true,
        },
        {
          label: "下井时间",
          prop: "DownWellTime",
          sort: true,
          width: 180,
        },
        {
          label: "最后移动时间",
          prop: "LastRecordTime",
          sort: true,
          width: 180,
        },
        {
          label: "IssuedId",
          prop: "IssuedId",
          sort: true,
          isShow: false,
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
              color: "var(--highlight-color)",
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
      GetStrategyJsonData(6941, formattedArray)
        .then((res) => {
          let { data } = res;
          this.table.dataSource = [];
          if (data[0].length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("人员撤离数据查询失败", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
    /* 全部/批量撤离事件 */
    soltHandel(row, text, type) {
      console.log("soltHandel", row, text, type);

      let params = {};
      let ids = [];
      if (text == "一键全矿撤离") {
        ids = this.table.dataSource.map((obj) => obj.IssuedId);
        params = {
          api_id: "DRY_XF_HJCL_QB",
          data: {
            IssuedId: ids,
          },
        };
      } else if (text == "批量撤离") {
        if (this.table.selectedRows.length == 0) {
          this.$message.error(`至少勾选一条数据！`);
          return;
        }
        ids = this.table.selectedRows.map((obj) => obj.IssuedId);
        params = {
          api_id: "DRY_XF_HJCL",
          data: {
            IssuedId: ids,
          },
        };
      }
      this.IssueInstructions_interface(params);
    },
    /* 人员撤离 撤离 */
    operationHandle(row, text) {
      console.log("人员撤离,撤离");
      let params = {
        api_id: "DRY_XF_HJCL",
        data: {
          IssuedId: [row.IssuedId],
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
