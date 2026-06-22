<template>
  <div class="header">
    <div class="header-left">
      <div class="back" @click="$router.back(-1)">
        <svg class="back-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        <span class="back-text">返回</span>
      </div>
      <div class="title">
        <span>{{ title }}</span>
      </div>
    </div>
    <div class="header-right">
      <ul v-if="showTab">
        <li
          v-for="(btn, index) in btns"
          :key="btn.text"
          :class="active == index ? 'active' : ''"
          @click="clickActive(index)"
        >
          {{ btn.text }}
        </li>
      </ul>
      <baseQueryBarVue
        v-if="showQuery"
        :formItemList="formItemList"
        :query="false"
        :showLabel="true"
        :changeSearch="true"
        :reSet="false"
        :isClearble="false"
        @search="query"
      />
    </div>
  </div>
</template>

<script>
import baseQueryBarVue from "@/components/personnelLocation/baseQueryBar.vue";
export default {
  name: "personnelCount",
  components: { baseQueryBarVue },
  props: {
    /* 显示tab标签 */
    showTab: {
      type: Boolean,
      default() {
        return true;
      },
    },
    /* 显示查询栏 */
    showQuery: {
      type: Boolean,
      default() {
        return false;
      },
    },
    title: String,
    btns: Array,
    index: {
      type: Number,
      default() {
        return 0;
      },
    },
    formItemList: {
      type: Array,
      default() {
        return [
          {
            type: "select",
            label: "类型",
            selectOptions: [
              { name: "部门", value: "部门" },
              { name: "职务", value: "职务" },
              { name: "工种", value: "工种" },
            ],
            param: "typeName",
            defaultSelect: "部门", // 下拉框默认选中项
          },
        ];
      },
    },
  },
  data() {
    return {
      active: this.index,
    };
  },
  methods: {
    clickActive(index) {
      this.active = index;
      this.$emit("countType", index);
    },
    query(result) {
      this.$emit("query", result);
    },
  },
};
</script>

<style scoped lang="scss">
// @import "@/assets/styles/publicStyle.scss";
.header {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;

  /* 头部左侧部分 */
  .header-left {
    display: flex;
    align-items: center;
    justify-content: space-around;

    /* 页面标题部分 */
    .title {
      span {
        background: var(--textBgColor);
        background-clip: text;
        color: transparent;
        font-size: 30px;
        font-weight: bold;
      }
    }
  }

  /* 右侧部分 */
  .header-right {
    display: flex;
    z-index: 999;
    top: 0;
    right: 0;
    margin: 10px;
    border: 1px;
    border-radius: 5px;

    .active {
      background: var(--chart-btn-activeBgColor);
      color: var(--chart-btn-activeColor);
      font-family: var(--font-family);
      font-weight: bold;
    }

    ul {
      display: flex;
      justify-content: space-around;
      margin: 0;
      padding: 1px;
      border: 1px solid var(--chart-btn-borderColor);
      border-radius: 5px;
    }

    li {
      width: 80px;
      height: 30px;
      margin: 0;
      padding: 0;
      border-radius: 5px;
      line-height: 30px;
      list-style: none;
      text-align: center;
    }

    li:hover {
      cursor: pointer;
    }
  }
}
</style>
