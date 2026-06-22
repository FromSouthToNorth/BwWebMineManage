<template>
  <div class="header-box">
    <div>
      <span class="title">{{title}} </span>
      <span class="dw">{{unit}}</span>
    </div>
    <!-- <div class="btn">
      <div class="export">
        <img src="../../assets/icon/export.png" alt="" />
        <span>导出</span>
      </div>
      <div class="full">
        <img src="../../assets/icon/full.png" alt="" />
        <span>全屏展示</span>
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
    name:'echartsHeader',
    props:{
        title:String,
        unit:String,
    }
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/root.scss";

.header-box {
  display: flex;
  z-index: -1;
  justify-content: space-between;
  width: 100%;
  color: var(--text-color);

  /* 单位 */
  :first-child {
    .dw {
      color: #77818b;
    }
  }

  /* 操作按钮 */
  .btn {
    display: flex;
    justify-content: space-around;
    width: 175px;
    height: 24px;
  }
}
</style>
