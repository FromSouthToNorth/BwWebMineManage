<template>
  <div>
    <Popup
      :isShow="showPopup"
      :title="'井下人员信息'"
      :isQuery="true"
      :changeSearch="changeSearch"
      :formItemList="
        customBtnState
          ? formConfigs.downUserQueryItem.item
          : formConfigs.downUserQueryCustomItem.item
      "
      :isQueryBtn="isQueryBtn"
      :isResetBtn="isQueryBtn"
      :isClearble="isQueryBtn"
      :tableData="table.dataSource"
      :columnOptions="
        customBtnState ? downUserQueryClo : downUserQueryCustomClo
      "
      :isShowFooter="false"
      :hasIndex="false"
      :width="'80%'"
      :paginationShow="paginationShow"
      :total="table.total"
      :appendToBody="true"
      :loading="table.loading"
      :customBtn="
        customBtnState
          ? formConfigs.downUserQueryItem.customBtn
          : formConfigs.downUserQueryCustomItem.customBtn
      "
      @columnClick="columnClick"
      @operationHandle="operationHandle"
      @search="search"
      @soltHandel="slotHandel"
      @tableChange="pageChange"
      @close="close"
    />
    <downUserNumInfoPopup ref="downUserNumInfoPopup"></downUserNumInfoPopup>
    <trackInfoPopup ref="trackInfoPopup"></trackInfoPopup>
    <userInfoPopup ref="userInfoPopup"></userInfoPopup>
  </div>
</template>

<script>
import Popup from "../trajectoryQuery.vue";
import downUserNumInfoPopup from "./downUserNumInfoPopup.vue";
import trackInfoPopup from "./trackInfoPopup.vue";
import userInfoPopup from "./userInfoPopup.vue";
import PLMixin from "@/mixin/personnelLocationMixin";
import {
  getIndexData,
  getPolicy5280,
  getSelectData,
} from "@/api/system/personnelLocation.js";
import {
  downUserQueryClo,
  downUserQueryInfoClo,
  downUserQueryCustomClo,
  formConfigs,
} from "../config/tableColumns";
import {
  handleApiResponse,
  handleColumnClick,
  handleOperationClick,
} from "@/utils/personnelLocationUtils";
export default {
  name: "downUserQueryPopup",
  components: {
    Popup,
    downUserNumInfoPopup,
    trackInfoPopup,
    userInfoPopup,
  },
  mixins: [PLMixin],
  data() {
    return {
      downUserType: "部门",
      /* true：分类查询，false：自定义查询 */
      customBtnState: true,
      /** 是否显示分页 */
      paginationShow: false,
      /** 是否显示查询按钮 */
      isQueryBtn: false,
      /** 是否在值改变时立即触发查询事件 */
      changeSearch: true,
      /** 导入的表格列配置 */
      downUserQueryClo,
      downUserQueryInfoClo,
      downUserQueryCustomClo,
      /** 导入的表单配置 */
      formConfigs,
    };
  },
  mounted() {
    // 组件挂载时的初始化操作
  },
  methods: {
    /**
     * 显示弹窗
     */
    show() {
      this.showPopup = true;
      this.loadData("部门");
    },
    /**
     * 关闭弹窗
     */
    close() {
      this.showPopup = false;
    },
    /**
     * 根据customBtnState请求不同的表格数据
     * customBtnState=true：分类查询，false：自定义查询
     * @param param
     */
    loadData(param) {
      console.log("loadData", param);
      this.table.loading = true;
      // 分类查询数据
      if (this.customBtnState) {
        console.log("分类查询");

        getIndexData(5255, param).then((res) => {
          handleApiResponse(
            res,
            (data) => {
              if (data.length != 0) {
                this.table.dataSource = data;
              }
            },
            (error) => {
              this.$message.error("分类查询数据请求失败:", error);
            },
            () => {
              this.table.loading = false;
            }
          );
        });
      } else {
        console.log("自定义查询");

        // 自定义查询数据
        this.GetSelectData(formConfigs.downUserQueryCustomItem.item)
          .then(() => {
            getPolicy5280(5280, param).then((res) => {
              handleApiResponse(
                res,
                (data) => {
                  if (data.length != 0) {
                    this.table.dataSource = data[0].data;
                    this.table.total = Number(data[0].total);
                  }
                },
                (error) => {
                  this.$message.error("自定义查询数据请求失败:", error);
                },
                () => {
                  this.table.loading = false;
                }
              );
            });
          })
          .catch((err) => {
            console.log("下拉框数据异常", err);
          });
      }
    },
    /* 获取自定义查询 下拉框数据 */
    GetSelectData(Array) {
      return new Promise((resolve, reject) => {
        getSelectData(5308)
          .then((res) => {
            let { data } = res;
            if (data[0].length != 0) {
              Array.forEach((item, index) => {
                switch (item.label) {
                  case "部门":
                    Array[index].selectOptions = [];
                    data[0].Department?.forEach((depart) => {
                      Array[index].selectOptions.unshift({
                        value: depart.Name,
                        name: depart.Name,
                      });
                    });
                    break;
                  case "工种":
                    Array[index].selectOptions = [];
                    data[0].WorkType?.forEach((depart) => {
                      Array[index].selectOptions.unshift({
                        value: depart.Name,
                        name: depart.Name,
                      });
                    });
                    break;
                  case "位置":
                  case "读卡器":
                    Array[index].selectOptions = [];
                    data[0].CardReader?.forEach((depart) => {
                      Array[index].selectOptions.unshift({
                        value: depart.Name,
                        name: depart.Name,
                      });
                    });
                    break;
                  case "职务":
                    Array[index].selectOptions = [];
                    data[0].Rank?.forEach((depart) => {
                      Array[index].selectOptions.unshift({
                        value: depart.Name,
                        name: depart.Name,
                      });
                    });
                    break;
                  case "区域":
                    Array[index].selectOptions = [];
                    data[0]?.region?.forEach((depart) => {
                      Array[index].selectOptions.unshift({
                        value: depart.Name,
                        name: depart.Name,
                      });
                    });
                    break;
                }
              });
            }
            resolve();
          })
          .catch((res) => {
            reject("下拉框数据请求失败:", res);
          });
      });
    },
    /* 表格列点击事件 */
    columnClick(row, ClickContent, label) {
      console.log("columnClick", row, ClickContent, label);
      const popupRefs = {
        downUserNumInfoPopup: this.$refs.downUserNumInfoPopup,
      };
      handleColumnClick(row, ClickContent, label, this, popupRefs);
    },
    /**
     * 操作按钮点击事件
     * @param row 当前行数据
     * @param value 按钮文本
     */
    operationHandle(row, value) {
      console.log("operationHandle", row, value);
      const popupRefs = {
        trackInfoPopup: this.$refs.trackInfoPopup,
        userInfoPopup: this.$refs.userInfoPopup,
      };
      handleOperationClick(row, value, this, popupRefs);
    },
    /* 井下人员信息查询事件 */
    search(result) {
      console.log("search", result);
      this.table.queryParam = result;
      if (this.customBtnState) {
        this.downUserType = result.type;
        this.loadData(result.type);
        // 设置第一列的描述为下拉选中的值
        this.downUserQueryClo[0].label = result.type;
      } else {
        this.loadData(result);
      }
    },
    /**
     * 自定义按钮点击事件
     * @param result
     */
    slotHandel(result) {
      console.log("slotHandel", result);
      this.customBtnState = !this.customBtnState;
      this.isQueryBtn = !this.isQueryBtn;
      this.paginationShow = !this.paginationShow;
      if (this.customBtnState) {
        this.changeSearch = true;
        this.loadData("部门");
      } else {
        this.changeSearch = false;
        this.loadData(result);
      }
    },
  },
};
</script>

<style></style>
