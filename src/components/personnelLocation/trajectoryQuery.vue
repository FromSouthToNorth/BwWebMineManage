<template>
  <div>
    <el-dialog :title="title" v-model="visible" :width="width" :append-to-body="false" :destroy-on-close="destroy"
      :close-on-click-modal="false" :modal="modal" @close="close">
      <div class="searchBar" v-if="isQuery">
        <baseQueryBarVue :formItemList="formItemList" :query="isQueryBtn" :queryName="queryName" :showLabel="true"
          :changeSearch="changeSearch" :reSet="isResetBtn" :resetName="resetName" :isClearble="isClearble"
          :customBtn="customBtn" :key="formItemList[0] ? formItemList[0].param : ''" @search="search"
          @soltHandel="soltHandel" />
      </div>
      <div class="table">
        <MyTable ref="myTable" :tableData="tableData" :tableColumnOptions="columnOptions"
          :paginationShow="paginationShow" :hasIndex="hasIndex" :selectionShow="selectionShow" :loading="loading"
          :maxHeight="maxHeight" :tableDataTotal="total" :headerCellStyle="headerCellStyle" :small="small"
          :pageCount="pageCount" :layOut="layOut" :size="size" :rowKey="rowKey" @tableUpdate="tableChange"
          @columnClick="columnClick" @selectionChange="selectionChange" @operationHandle="operationHandle" />
      </div>
      <div v-if="isShowFooter" class="bottom">
        <el-button @click="visible = false">{{ cancelName }}</el-button>
        <el-button type="primary" @click="confirmBtn">{{
          confirmName
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MyTable from "@/components/personnelLocation/tableComponent.vue";
import baseQueryBarVue from "@/components/personnelLocation/baseQueryBar.vue";
import { DATA_THEME } from "@/store/mutation-types.js";
export default {
  name: "trajectoryQuery",
  components: { MyTable, baseQueryBarVue },
  props: {
    size: Number,
    /* 表格的最大高度 */
    maxHeight: {
      type: [Number, String],
      default: 500,
    },
    selectionShow: {
      type: Boolean,
      default: false,
    },
    /* 是否遮罩层 */
    modal: {
      type: Boolean,
      default: true,
    },
    /* 关闭时销毁对话框中的元素 */
    destroy: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    params: Object,
    title: String,
    width: String,
    changeSearch: {
      type: Boolean,
      default: true,
    },
    isClearble: {
      type: Boolean,
      default: false,
    },
    /* 是否查询按钮 */
    isQueryBtn: {
      type: Boolean,
      default: false,
    },
    /* 自定义查询按钮 */
    customBtn: Array,
    /* 查询按钮名称 */
    queryName: String,
    /* 是否有重置按钮 */
    isResetBtn: {
      type: Boolean,
      default: true,
    },
    /* 重置按钮名称 */
    resetName: String,
    /* 是否分页 */
    paginationShow: {
      type: Boolean,
      default: false,
    },
    /* 总条数 */
    total: [Number, String],
    /* 分页器是否小型 */
    small: {
      type: Boolean,
      default: false,
    },
    /* 分页数在多少时折叠 */
    pageCount: {
      type: [Number, String],
      default: 7,
    },
    layOut: {
      type: String,
      default: "total,prev,pager,next,sizes",
    },
    //取消按钮名称
    cancelName: {
      type: String,
      default: "取 消",
    },
    //确定按钮名称
    confirmName: {
      type: String,
      default: "确 定",
    },
    //是否自定底部
    isShowFooter: {
      type: Boolean,
      default: true,
    },
    // 是否将自身插入至 body 元素，有嵌套的弹窗时一定要设置
    appendToBody: {
      type: Boolean,
      default: false,
    },
    // 弹窗是否展示
    isShow: {
      type: Boolean,
      default: false,
    },
    /* 是否有查询栏 */
    isQuery: {
      type: Boolean,
      default() {
        return true;
      },
    },
    /* 查询栏数组 */
    formItemList: {
      type: Array,
      default() {
        return [
          {
            type: "date",
            placeholder: "选择日期",
            param: "date",
            label: "日期",
            defaultSelect: new Date(),
          },
        ];
      },
    },
    /* 表格数据 */
    tableData: {
      type: Array,
    },
    //表格复选框绑定的唯一键，用于保留勾选的数据
    rowKey: String,
    /* 表格列名 */
    columnOptions: {
      type: Array,
      default() {
        return [];
      },
    },
    /* 表头样式 */
    headerCellStyle: {
      type: Object,
      default() {
        return {
          color:
            localStorage.getItem(DATA_THEME) == "light"
              ? "rgba(255, 255, 255, 1)"
              : "#FFCF00",
        };
      },
    },
    /* 是否启用序号 */
    hasIndex: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      id: 0,
    };
  },
  created() {
    console.log(this.columnOptions);
  },
  computed: {
    visible: {
      get() {
        return this.isShow;
      },
      set(val) {
        this.$emit("update:isShow", false);
      },
    },
  },
  watch: {
    visible(val) {
      // 在此做显示与隐藏的交互
      if (!val) {
        this.$emit("close");
      } else {
        this.$emit("open");
      }
    },
  },
  methods: {
    selectionChange(result) {
      this.$emit("selectionChange", result);
    },
    /* 日期改变时 */
    search(result) {
      console.log(result);
      // console.log(this.$refs);
      this.$refs.myTable.updateCurrpage();
      this.$emit("search", result);
    },
    /* 自定义按钮点击事件 */
    soltHandel(result, text) {
      this.$emit("soltHandel", result, text);
    },
    confirmBtn() {
      // 触发保存
      let data = {};
      this.$emit("handleSave", data);
    },
    /* 分页改变时 */
    tableChange(result) {
      this.$emit("tableChange", result);
    },
    /**
     * 单元格点击事件
     * @param result
     * @param text
     * @param label
     */
    columnClick(result, text, label) {
      this.$emit("columnClick", result, text, label);
    },
    /**
     * 操作列点击事件
     * @param result 当前行
     * @param value 值
     */
    operationHandle(result, value) {
      console.log("operationHandle", result, value);

      this.$emit("operationHandle", result, value);
    },
    close() {
      console.log(11111);
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/root.scss";

::v-deep .el-dialog {
  border: 1px;
  border-radius: 10px;
  background: var(--popup-bgColor) !important;

  .el-dialog__title {
    color: var(--popup-textColor) !important;
  }

  .el-dialog__body {
    padding: 10px;
  }
}

.bottom {
  margin-top: 10px;
  text-align: right;

  /* ::v-deep .el-button{
    border:1px solid #213042;
    background: transparent;
  } */
}
</style>
