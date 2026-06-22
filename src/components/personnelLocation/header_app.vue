<template>
  <div class="header">
    <div class="Controls">
      <div class="back" @click="$router.back(-1)">
        <i class="el-icon-arrow-left"></i>
        <span class="back-text">上一页</span>
      </div>
      <div v-for="obj in list" :key="obj.path">
        <div class="gocount" >
          <span @click="gotoPath(obj.path)">{{ obj.name }}</span>
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>
    <div class="btn" v-if="isScreen">
        <div class="img" @click="screen">
          <img
            :src="imgUrl"
            alt=""
          />
        </div>
    </div>
  </div>
</template>

<script>
import { getImgPath } from "@/views/personnel_location/downholeInfoJs";
export default {
  name: "header_app",
  components: {},
  props: {
    // 有无筛选条件
    isScreen: {
      type: Boolean,
      default: true,
    },
    /* 按钮集合 */
    list: {
      type: Array,
      default() {
        return [
          {
            name: "累计下井时长统计",
            path: "userInfo_count_app",
          }
        ];
      },
    },
  },
  data(){
    return{
      imgUrl:''
    }
  },
  mounted(){
    this.imgUrl=getImgPath()
  },
  methods: {
    /* 路径跳转 */
    gotoPath(path) {
      this.$emit("gotoPath", path);
    },
    /* 筛选条件 */
    screen(){
      this.$emit('screen')
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/root.scss";

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--chart-bgColor);
  color: var(--header-btn-textColor);

  .Controls {
    display: flex;
    align-items: center;

    .gocount {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 32px;
      margin-right: 10px;
      padding: 6px 8px;
      border: 1px;
      border-radius: 4px;
      background: var(--header-btn-bgColor);
      font-size: 13px;
    }

    .back {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 80px;
      height: 32px;
      margin: 10px;
      padding: 6px 8px;
      border: 1px;
      border-radius: 4px;
      background: var(--header-btn-bgColor);
      font-size: 13px;
      gap: 8px;

      :hover {
        cursor: pointer;
      }

      div {
        display: flex;
      }
    }
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 32px;
    height: 32px;
    margin-right: 15px;
    border: 1px;
    border-radius: 4px;
    // background-color: rgb(40 59 73 / 100%);
    background-color: var(--header-btn-bgColor);
    color: aqua;
    font-size: 13px;
    text-align: right;

    .img{
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;

    }
  }
}
</style>
