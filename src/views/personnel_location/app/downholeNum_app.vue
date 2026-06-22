<template>
  <div class="persionNum_app" :style="{ height: `${clientHeight - 41}px` }">
    <headerApp :isScreen="true" :list="[]" @screen="screen" />
    <div class="title">
      {{ params.year }}-{{ params.month }}-{{ params.day }} 下井人数
      {{ params.total }} 人
    </div>
    <div
      style="height: 100%"
      @touchstart="touchstart"
      @touchmove="touchmove"
      @touchend="touchend"
    >
      <div id="persionBar" style="width: 100%; height: 100%"></div>
    </div>
    <myDrawer
      :drawer="drawer"
      :content="typeSelected"
      :title="'条件筛选'"
      @handleClose="handleClose"
      @search="search"
    />
  </div>
</template>

<script>
import headerApp from "@/components/personnelLocation/header_app.vue";
import myDrawer from "@/components/personnelLocation/myDrawer.vue";
import { getinitBar_app } from "@/views/personnel_location/downholeInfoJs.js";
import { getpolicy5264 } from "@/api/system/personnelLocation";
import querybar from "@/components/personnelLocation/baseQueryBar.vue";
export default {
  name: "downholeNum_app",
  components: { querybar, headerApp, myDrawer },
  data() {
    return {
      title: "人员定位历史下井信息",
      typeSelected: [
        {
          type: "select",
          label: "类型",
          selectOptions: [
            { name: "部门", value: "部门" },
            { name: "职务", value: "职务" },
            { name: "工种", value: "工种" },
          ],
          param: "typeName",
          defaultSelect: "部门",
        },
      ],
      barXData: [],
      barYData: [],
      params: {},
      type: "部门",
      year: "",
      month: "",
      day: "",
      size: 10,
      drawer: false,
      /* PaginationMixin data */
      page: 1,
      total: 0,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isMove: false,
      clientHeight: 0,
    };
  },
  mounted() {
    /* initClientHeight from AppMixin */
    this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    this.params = this.$route.params;
    this.year = this.$route.params.year;
    this.month = this.$route.params.month;
    this.day = this.$route.params.day;
    this.getdata();
  },
  methods: {
    /**
     * calculateTotalPages - from AppMixin
     */
    calculateTotalPages(data, size) {
      return data.length % size === 0
        ? data.length / size
        : Math.ceil(data.length / size);
    },
    /**
     * touch handlers - from AppMixin
     */
    touchstart(e) {
      this.startX = e.touches[0].pageX;
      this.startY = e.touches[0].pageY;
    },
    touchmove(e) {
      this.isMove = true;
      this.endX = e.touches[0].pageX;
      this.endY = e.touches[0].pageY;
    },
    /**
     * handlePagination - from PaginationMixin
     */
    handlePagination(direction) {
      if (direction === 'right') {
        if (this.page <= 1) return;
        this.page--;
      } else if (direction === 'left') {
        if (this.page >= this.total) {
          return;
        }
        this.page++;
      }
      if (this.page > 0 && this.page <= this.total) {
        this.initBar();
      }
    },
    screen() {
      this.drawer = true;
    },
    handleClose() {
      this.drawer = false;
    },
    initBar() {
      let routeInfo = {
        path: "turnOutInfo_app",
        param: {
          year: this.year,
          month: this.month,
          day: this.day,
          type: this.type,
        },
      };
      routeInfo.param.type = this.type;
      getinitBar_app(
        this,
        document.getElementById("persionBar"),
        "人数",
        routeInfo
      );
    },
    async getdata() {
      let date = this.params;
      let par = {
        month: `${date.year}${date.month < 10 ? "0" + date.month : date.month}`,
        day: `${date.year}-${date.month}-${date.day}`,
        type: this.type,
      };
      const { data } = await getpolicy5264(5264, par);
      if (data.length != 0) {
        this.barXData = [];
        this.barYData = [];
        data.forEach((item) => {
          this.barXData.push(item.ch == null ? "空" : item.ch);
          this.barYData.push(item.num);
        });
      }
      this.total = this.calculateTotalPages(this.barYData, this.size);
      this.initBar();
    },
    search(result) {
      this.drawer = false;
      this.type = result.typeName;
      this.getdata();
    },
    dataClickNext() {
      this.page = this.page + 1;
      this.initBar();
    },
    dataClickNev() {
      this.page = this.page - 1;
      this.initBar();
    },
    touchend(e) {
      let X = this.endX - this.startX,
        Y = this.endY - this.startY;
      if (this.isMove) {
        let direction = '';
        if (X > 0 && Math.abs(X) > Math.abs(Y)) {
          direction = 'right';
        } else if (X < 0 && Math.abs(X) > Math.abs(Y)) {
          direction = 'left';
        }
        this.isMove = false;
        this.handlePagination(direction);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.persionNum_app {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  background-color: var(--chart-bgColor);

  .title {
    text-align: center;
  }

  ::v-deep .dialog-search {
    flex: none;
  }

  #persionBar {
    width: 100%;
    height: 100%;
  }
}
</style>
