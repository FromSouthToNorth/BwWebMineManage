<template>
  <div class="tabBox">
    <!-- 表格 -->
    <el-table class="table" @sort-change="handleSortChange" :cell-style="cellStyle" :header-cell-style="headerCellStyle"
      header-row-class-name="table_header_class" @selection-change="selectionChange" v-loading="loading"
      element-loading-text="数据加载中..." :element-loading-background="loadingBgColor" :max-height="maxHeight"
      :data="tableData" :border="hasBorder" :row-class-name="tableRowClassName" :row-key="(row) => row[rowKey]"
      @cell-click="cellClick" @row-click="rowClick" @row-contextmenu="rowContextmenu">
      <el-table-column type="selection" width="50" :reserve-selection="true" v-if="selectionShow">
      </el-table-column>
      <!-- 序号列 -->
      <el-table-column v-if="hasIndex" type="index" label="#" header-align="center" align="center" width="80">
      </el-table-column>
      <template v-for="item in tableColumnOptions">
        <!-- 非插槽列 -->
        <template v-if="!item.slots">
          <el-table-column v-if="item.isShow === undefined || item.isShow === true" :key="item.label" :prop="item.prop"
            :label="item.label" :width="columnWidth(item)" :formatter="formatData" :sortable="item.sort"
            :align="textAlign(item)" :show-overflow-tooltip="true">
          </el-table-column>
        </template>
        <!-- 插槽列 -->
        <template v-else>
          <el-table-column v-if="item.columnType" :key="item.label" :prop="item.prop" :label="item.label"
            :width="item.width" :header-align="item.headerAlign || 'center'" :align="item.align || 'center'">
            <template #default="{ row }">
              <!-- 不显示在更多里面 -->
              <template :key="OutMore.data" v-for="OutMore in isMore.isOutMore">
                <span @click="controls(row, OutMore.data)" :style="{ color: OutMore.color, marginRight: '5px' }">
                  {{ OutMore.data }}
                </span>
              </template>
              <!-- 显示在更多里面 -->
              <template v-if="isMore.isInMore.length > 1">
                <el-dropdown @command="controls(row, $event)">
                  <span class="el-dropdown-link" style="color: var(--highlight-color)">
                    更多 <i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-for="inMore in isMore.isInMore" :key="inMore.slotName" :command="inMore.data"
                        class="custom-dropdown-item" :class="editIcon(inMore.data)" :style="{ color: inMore.color }">
                        {{ inMore.data }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </template>
          </el-table-column>
        </template>
      </template>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination" v-if="paginationShow">
      <!-- <span class="total">共 {{ tableDataTotal }} 条</span> -->
      <el-pagination :hide-on-single-page="isShowPagination" :page-sizes="[20, 50, 100, 500]"
        :current-page="currentPage" :page-size="pageSize" :total="tableDataTotal" :small="small"
        :pager-count="pagerCount" background :layout="layOut" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>
<script>
import { tableRowClassName } from "@/utils/style";

export default {
  name: "BaseTable",
  props: {
    /* 分页器是否小型 */
    small: {
      type: Boolean,
      default: false,
    },
    size: {
      type: [Number, String],
      default: 20,
    },
    pagerCount: {
      type: [Number, String],
      default: 7,
    },
    layOut: {
      type: String,
      default: "total, prev, pager, next, sizes",
    },
    tableName: String,
    /* 最大高度 */
    maxHeight: {
      type: [Number, String],
      default() {
        return 600;
      },
    },
    /* 表头颜色 */
    headerCellStyle: {
      type: Object,
      default() {
        return {
          // color:localStorage.getItem(DATA_THEME)=='light'?'rgba(255, 255, 255, 1)':'var(--table-HeaderTextColor)'
          color: "var(--table-HeaderTextColor)",
        };
      },
    },
    /* 行颜色 */
    columnBgColor: {
      type: Object,
      default() {
        return {
          // oddColor: "rgb(6 21 28 / 40%)",
          // evenColor: "rgb(13 48 62 / 100%)",
          oddColor: "var(--table-OddColor)",
          evenColor: "var(--table-EvenColor)",
          allColor: "",
        };
      },
    },
    // 表格数据
    tableData: {
      type: Array,
      default() {
        return [];
      },
    },
    rowKey: String,
    // 表格列项
    tableColumnOptions: {
      type: Array,
      require: true,
    },
    // 表格数据总量
    tableDataTotal: {
      type: [Number, String],
    },
    // 是否具有索引
    hasIndex: {
      type: Boolean,
      default() {
        return false;
      },
    },
    // 是否显示边框
    hasBorder: {
      type: Boolean,
      default() {
        return false;
      },
    },
    // 是否显示选择框
    selectionShow: {
      type: Boolean,
      default() {
        return false;
      },
    },
    // 是否显示选分页器
    paginationShow: {
      type: Boolean,
      default() {
        return true;
      },
    },
    loading: {
      type: Boolean,
      default() {
        return true;
      },
    },
  },
  data() {
    return {
      // 表格当前页数
      currentPage: 1,
      // 表格每页数量
      pageSize: this.size,
      index: 0,
      headerStyle: {},
      loadingBgColor: "",
    };
  },
  watch: {
    size(newVal) {
      this.value = newVal;
    },
  },
  computed: {
    // 计算是否显示分页器
    isShowPagination() {
      const isShow = this.tableDataTotal === 0;
      return isShow;
    },
    isMore() {
      // 获取表格列配置选项数组
      let arr = this.$props.tableColumnOptions;
      let result = {
        isInMore: [],
        isOutMore: [],
      };

      arr.forEach((item) => {
        // 当列配置的prop属性为'edit'时，处理其slots数组中的元素
        if (item.prop === "edit" && item.slots) {
          item.slots.forEach((obj) => {
            // 根据obj.isInMore属性的值将元素归类到不同分组
            if (obj.isInMore || obj.isInMore == undefined) {
              result.isInMore.push(obj);
            } else {
              result.isOutMore.push(obj);
            }
          });
        }
      });

      return result;
    },
    dataColumn() {
      // 获取表格列配置选项数组
      let arr = this.$props.tableColumnOptions;
      let result = {
        data: [],
        edit: [],
      };
      arr.forEach((item) => {
        if (item.prop === "edit") {
          result.edit.push(item);
        } else {
          result.data.push(item);
        }
      });
      return result;
    },
  },
  mounted() {
    if (this.isMobile()) {
      return;
    }
    this.$props.tableColumnOptions.forEach((item) => {
      if (item.label == "姓名" || item.label.indexOf("时间") != -1) {
        item.sort = true;
      }
      if (item.prop == "num") {
        item.align = "center";
      }
    });
  },
  created() {
    // 遮罩层背景色
    // if(localStorage.getItem(DATA_THEME)=='light'){
    //   this.loadingBgColor='#fff'
    // }else{
    //    this.loadingBgColor='rgba(23, 73, 94, 1)'
    // }
    this.loadingBgColor = "var(--BgColor)";
  },
  methods: {
    tableRowClassName,
    /* 排序事件 */
    handleSortChange(obj) {
      // console.log('handleSortChange',obj);
    },
    /* 操作列icon */
    editIcon(text) {
      let icon = "";
      switch (text) {
        case "人员":
          icon = "el-icon-user";
          break;
        case "轨迹":
          icon = "el-icon-s-promotion";
          break;
        case "个人出勤":
          icon = "el-icon-user-solid";
          break;
      }
      return icon;
    },
    /* 列宽 */
    columnWidth(item) {
      return item.width || (item.prop === "num" ? 80 : "");
    },
    textAlign(item) {
      let align = "left";
      if (item.prop == "num") {
        align = "center";
      }
      return align;
    },
    isMobile() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      // localStorage.setItem('isiphone',flag)
      return flag;
    },
    widthHandel(item) {
      let width = "auto";
      if (item.prop == "num") {
        width = 80;
      } else if (item.width) {
        width = item.width;
      }
      return width;
    },
    /* 右键事件 */
    rowContextmenu() {
      this.$emit("rowContextmenu");
    },
    /* 插槽点击事件 */
    controls(result, value) {
      this.$emit("columnClick", result, value);
      this.$emit("operationHandle", result, value);
    },
    /* 数据转换 */
    formatData(row, clo) {
      if (row[clo.property] === "") {
        return "-";
      } else {
        return row[clo.property];
      }
    },
    /* 行点击事件 */
    rowClick(row) {
      this.$emit("rowClick", row, this.tableName);
    },
    /* 单元格点击事件 */
    cellClick(row, column, cell, event) {
      let text = event.target.innerText;
      if (column.label == "姓名" || column.label == "人数") {
        this.$emit("columnClick", row, text, column.label);
      }
      // else if(column.label=='轨迹查询'){
      //   this.$emit('columnClick',row,true)
      // }
      // else if(column.label=='操作'){
      //   this.$emit('columnClick',row,text)
      // }
    },
    cellStyle({ row, column, columnIndex }) {
      let textColor = "var(--text-color)";
      let highlightColor = "var(--highlight-color)";

      // 处理“状态”列
      if (column.label === "状态") {
        return { color: row.state === "正常" ? "green" : "red" };
      }

      // 如果有选择框或序号列，调整 columnIndex
      if (this.selectionShow || this.hasIndex) {
        columnIndex -= this.selectionShow ? 1 : 0;
        columnIndex -= this.hasIndex ? 1 : 0;
      }

      // 检查 columnIndex 是否在 tableColumnOptions 中
      if (columnIndex >= 0 && columnIndex < this.tableColumnOptions.length) {
        const columnOption = this.tableColumnOptions[columnIndex];

        // 使用配置的颜色优先，如果没有配置，按 isEvent 来决定颜色
        if (columnOption.color) {
          return { color: columnOption.color }; // 使用配置的颜色
        } else if (columnOption.isEvent) {
          return { color: highlightColor }; // 使用高亮颜色
        }
      }

      // 默认返回文本颜色
      return { color: textColor };
    },
    // 修改当前页
    handleCurrentChange(val) {
      this.currentPage = val;
      const params = {
        currentPage: val,
        pageSize: this.pageSize,
      };
      this.$emit("tableUpdate", params);
    },
    updateCurrpage() {
      this.currentPage = 1;
    },
    // 修改每页数量
    handleSizeChange(val) {
      this.pageSize = val;
      const params = {
        currentPage: this.currentPage,
        pageSize: val,
      };
      this.$emit("tableUpdate", params);
    },
    // 选择框改变
    selectionChange(e) {
      this.$emit("selectionChange", e);
    },
  },
};
</script>
<style scoped lang="scss">
.custom-dropdown-item {
  display: flex;
  /* 使用 flexbox */
  align-items: center;
  /* 垂直居中对齐 */
  word-wrap: break-word;
  /* 强制长单词换行 */
  white-space: normal;
  /* 允许换行 */
}
</style>
