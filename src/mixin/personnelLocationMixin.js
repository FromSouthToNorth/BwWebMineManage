const personnelLocation = {
  data() {
    return {
      showPopup: false,
      table: {
        dataSource: [],
        total: 0,
        pageNo: 1,
        pageSize: 20,
        loading: false,
        queryParam: {},
        currentRow: {},
        selectedRowKeys: [],
        selectedRows: [],
      },
    };
  },
  methods: {
    search(result) {
      this.loadData(result);
    },
    /* 分页改变事件 */
    pageChange(result) {
      console.log("pageChange", result);
      let param = {
        ...this.table.queryParam,
        ...this.pageFieldConvert(result),
      };
      this.loadData(param);
    },
    /**
     * 表格选中事件
     * @param {Array} rows 当前选中的数据
     */
    selectionChange(rows) {
      this.table.selectedRows = rows;
    },
    /* 将分页组件返回的字段转换为策略需要的分页字段 */
    pageFieldConvert(result) {
      return { Page: result.currentPage, Row: result.pageSize };
    },
    /* 获取设备状态历史报警默认时间参数 */
    getDeviceHisTimes() {
      const deviceHis = this.deviceHisForm.item;
      const startTime = deviceHis.find(
        (item) => item.param === "StartTime"
      ).defaultSelect;
      const endTime = deviceHis.find(
        (item) => item.param === "EndTime"
      ).defaultSelect;
      const Times = {
        StartTime: startTime,
        EndTime: endTime,
      };
      return Times;
    },
    /**
     * 为查询参数追加分页默认值（仅当不存在时）
     * @param {Object} queryParam - 现有的查询参数对象
     * @returns {Object} 修改后的对象
     */
    addDefaultParam(queryParam) {
      if (!queryParam || typeof queryParam !== "object") {
        queryParam = {};
      }

      // 追加 Page（如果不存在）
      if (queryParam.Page == null) {
        queryParam.Page = this.table.pageNo;
      }

      // 追加 Row（如果不存在）
      if (queryParam.Row == null) {
        queryParam.Row = this.table.pageSize;
      }

      return queryParam;
    },
  },
};
export default personnelLocation;
