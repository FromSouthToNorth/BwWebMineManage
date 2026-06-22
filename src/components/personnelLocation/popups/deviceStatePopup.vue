<template>
  <div>
    <!-- 设备状态 -->
    <Popup
      :isShow="showPopup"
      :title="'设备状态'"
      :isQuery="true"
      :changeSearch="!isQueryBtn"
      :isQueryBtn="isQueryBtn"
      :isResetBtn="true"
      :isClearble="true"
      :isShowFooter="false"
      :hasIndex="false"
      :paginationShow="true"
      :appendToBody="true"
      :width="'80%'"
      :formItemList="deviceBtnState ? deviceRealForm.item : deviceHisForm.item"
      :customBtn="
        deviceBtnState ? deviceRealForm.customBtn : deviceHisForm.customBtn
      "
      :columnOptions="deviceBtnState ? deviceRealCol : deviceHisCol"
      :tableData="table.dataSource"
      :total="table.total"
      :loading="table.loading"
      @soltHandel="DeviceSoltHandel"
      @tableChange="pageChange"
      @search="DeviceSearch"
      @close="close"
    />
    <powerInfoPopup ref="powerInfoPopup"></powerInfoPopup>
  </div>
</template>

<script>
import Popup from "../trajectoryQuery.vue";
import PLMixin from "@/mixin/personnelLocationMixin";
import powerInfoPopup from "@/components/personnelLocation/popups/powerInfoPopup.vue";
import {
  getPolicy5303,
  getPolicy2572,
  getPolicy5400,
  getPolicy6726,
  getSelectData,
} from "@/api/system/personnelLocation";
import {
  formatterDate,
  getCurrDateTime,
  getInitDate,
} from "@/views/personnel_location/downholeInfoJs";
export default {
  name: "deviceStatePopup",
  components: {
    Popup,
    powerInfoPopup,
  },
  mixins: [PLMixin],
  data() {
    return {
      // 是否显示查询按钮
      isQueryBtn: false,
      /** true:实时报警,false:历史报警 */
      deviceBtnState: true,
      //实时查询栏
      deviceRealForm: {
        item: [
          {
            type: "select",
            selectOptions: [],
            placeholder: "选择区域",
            param: "AreaName",
            label: "区域",
          },
          {
            type: "select",
            selectOptions: [
              { name: "正常", value: "正常" },
              { name: "异常", value: "异常" },
            ],
            placeholder: "选择状态",
            param: "State",
            label: "状态",
          },
          {
            type: "select",
            selectOptions: [],
            placeholder: "选择读卡器",
            param: "DevicePosition",
            label: "读卡器",
          },
        ],
        customBtn: [
          {
            soltName: "query",
            btnName: "历史报警",
          },
          {
            soltName: "query",
            btnName: "电源信息",
          },
        ],
      },
      //历史查询栏
      deviceHisForm: {
        item: [
          {
            type: "datetime",
            param: "StartTime",
            label: "开始时间",
            defaultSelect: formatterDate(
              getInitDate(6).StartTime,
              "yyyy-MM-dd"
            ),
          },
          {
            type: "datetime",
            param: "EndTime",
            label: "结束时间",
            defaultSelect: formatterDate(getInitDate(6).EndTime, "yyyy-MM-dd"),
          },
          {
            type: "select",
            param: "AlarmType",
            selectOptions: [],
            label: "报警类型",
          },
          {
            type: "input",
            param: "Remarks",
            placeholder: "模糊查询",
            label: "报警内容",
          },
          {
            type: "input",
            param: "Name",
            placeholder: "模糊查询",
            label: "设备名称",
          },
        ],
        customBtn: [
          {
            soltName: "query",
            btnName: "实时报警",
          },
        ],
      },
      /* 实时列 */
      deviceRealCol: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "区域",
          prop: "AreaName",
        },
        {
          label: "分站",
          prop: "Branch",
        },
        {
          label: "读卡器",
          prop: "DevicePosition",
        },
        {
          label: "状态",
          prop: "state",
        },
      ],
      /* 历史列*/
      deviceHisCol: [
        {
          label: "#",
          prop: "num",
        },
        {
          label: "报警类型",
          prop: "AlarmType",
        },
        {
          label: "设备编号",
          prop: "Number",
        },
        {
          label: "设备名称",
          prop: "Name",
        },
        {
          label: "报警内容",
          prop: "Remarks",
        },
        {
          label: "报警时间",
          prop: "StartTime",
        },
        {
          label: "报警结束时间",
          prop: "EndTime",
        },
      ],
    };
  },
  methods: {
    show() {
      this.showPopup = true;
      this.GetSelectData(this.deviceRealForm.item);
      this.loadData();
    },
    close() {
      this.showPopup = false;
    },
    loadData(param) {
      let paramObj = this.addDefaultParam(param);
      if (this.deviceBtnState) {
        this.getDevStateData(paramObj);
      } else {
        this.getDevHisData({ ...paramObj, ...this.getDeviceHisTimes() });
      }
    },
    /* 获取设备状态下拉框数据 */
    async GetSelectData(Array) {
      const { data } = await getSelectData(5308);
      if (data[0].length != 0) {
        Array.forEach((item, index) => {
          switch (item.label) {
            case "部门":
              Array[index].selectOptions = [];
              data[0].Department.forEach((depart) => {
                Array[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
            case "工种":
              Array[index].selectOptions = [];
              data[0].WorkType.forEach((depart) => {
                Array[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
            case "位置":
            case "读卡器":
              Array[index].selectOptions = [];
              data[0].CardReader.forEach((depart) => {
                Array[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
            case "职务":
              Array[index].selectOptions = [];
              data[0].Rank.forEach((depart) => {
                Array[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
            case "区域":
              Array[index].selectOptions = [];
              data[0].region.forEach((depart) => {
                Array[index].selectOptions.unshift({
                  value: depart.Name,
                  name: depart.Name,
                });
              });
              break;
          }
        });
      }
    },
    /* 设备状态自定义按钮事件 */
    DeviceSoltHandel(result, text) {
      switch (text) {
        case "历史报警":
          this.deviceBtnState = false;
          this.isQueryBtn = true;
          this.getSelectOptions();
          this.loadData();
          break;
        case "实时报警":
          this.deviceBtnState = true;
          this.isQueryBtn = false;
          this.loadData();
          break;
        case "电源信息":
          this.$refs.powerInfoPopup.show();
          break;
      }
    },
    /* 设备状态查询事件 */
    DeviceSearch(result) {
      this.table.currentRow = result;
      if (!this.deviceBtnState) {
        this.getDevHisData(result);
        return;
      }
      this.getDevStateData(result);
    },
    /* 获取设备状态数据(实时) */
    getDevStateData(param) {
      this.table.loading = true;
      this.table.dataSource = [];
      getPolicy5303(5303, param)
        .then((res) => {
          let { data } = res;
          if (data.length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("获取设备状态数据失败:", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
    /* 获取历史报警 报警类型下拉框选择数据 */
    getSelectOptions() {
      getPolicy5400()
        .then((res) => {
          let { data } = res;
          if (data.length != 0) {
            this.deviceHisForm.item.forEach((item, index) => {
              if (item.param == "AlarmType") {
                item.selectOptions = [];
                item.selectOptions = data[0].Alarmtype;
              }
            });
          }
        })
        .catch((res) => {
          this.$message.error("获取查询栏下拉数据失败:", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
    /* 获取设备历史报警数据 */
    getDevHisData(param) {
      this.table.loading = true;
      getPolicy2572(2572, param)
        .then((res) => {
          let { data } = res;
          this.table.dataSource = [];
          if (data.length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("获取设备状态数据失败:", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
    /* 获取电源信息数据 */
    getPowerInformationData(param) {
      this.table.loading = true;
      getPolicy6726(param)
        .then((res) => {
          let { data } = res;
          this.table.dataSource = [];
          if (data.length != 0) {
            this.table.dataSource = data[0].data;
            this.table.total = Number(data[0].total);
          }
        })
        .catch((res) => {
          this.$message.error("获取设备状态数据失败:", res);
        })
        .finally((res) => {
          this.table.loading = false;
        });
    },
  },
};
</script>

<style></style>
