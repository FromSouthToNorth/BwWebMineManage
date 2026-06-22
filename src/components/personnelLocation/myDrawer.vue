<template>
    <div class="myDrawer">
        <el-drawer
        :title="title"
        v-model="visible"
        :direction="direction"
        :before-close="handleClose"
        :size="'80%'"
        >
            <div class="content">
                <querybar
                 :formItemList="content"
                 :reSet="true"
                 @search='search'
                />
            </div>
        </el-drawer>
    </div>
</template>

<script>
import querybar from "@/components/personnelLocation/baseQueryBar.vue";
export default {
    name:"",
    components:{querybar},
    props:{
        /* 是否弹出 */
        drawer:{
            type:Boolean,
            default:false
        },
        /* 在哪里弹出  */
        direction:{
            type:String,
            /*  rtl:从右往左
                ltr:从左往右
                ttb:从上往下
                btt:从下往上
            */
            default:"btt"
        },
        /* 标题 */
        title:String,
        /* 内容 */
        content:Array
    },
    data(){
        return{

        }
    },
    computed:{
        visible: {
            get() {
                return this.drawer;
            },
            set(val) {
                this.$emit("update:drawer", false);
            },
        },
    },
    methods:{
        /* 关闭按钮 回调 */
        handleClose(done){
            this.$emit('handleClose',done)
        },
        /* 查询 */
        search(result){
            this.$emit('search',result)
        }

    }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/root.scss";


::v-deep .dialog-search .el-form.demo-form-inline.el-form--inline{
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  width: 100%;

}

::v-deep .dialog-search[data-v-59026906] .el-form-item, .dialog-search .el-form-item--medium[data-v-59026906]{
  width: 100%;
}

::v-deep .el-form-item--medium .el-form-item__content{
  width: 100%;
}

/* 每一个查询框 */
::v-deep [data-v-57fa69b2] .dialog-search[data-v-59026906] .el-form-item, .dialog-search .el-form-item--medium[data-v-59026906][data-v-57fa69b2]{
  padding: 5px 20px;
}

/* 输入框 */
::v-deep .dialog-search .el-form input {
  width: 100% !important;
  background-color: var(--drawer-inputBgColor);

}

/* 下拉选择 */
::v-deep .el-select{
  width: 100% !important;
}

/* 按鈕 */
::v-deep .el-form-item__content {
  display: flex;
  justify-content: space-around;

  .el-button.query.el-button--primary.el-button--mini,
  .el-button.reset.el-button--primary.el-button--mini{
    width: 25%;
    height:34px;
  }

}

::v-deep .dialog-search[data-v-59026906] .el-date-editor.el-input, .dialog-search .el-date-editor.el-input__inner[data-v-59026906]{
  width: 100% !important;
}

/* 整个弹窗 */
::v-deep .el-drawer.btt{
  // background: rgb(31 80 107 / 80%);
  background-color: var( --drawer-bgColor);

}

/* 头部 */
::v-deep .el-drawer__header{
  margin: 5px;
  padding: 5px;
  color: var( --drawer-textColor);
}

</style>
