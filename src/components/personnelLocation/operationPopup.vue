<template>
  <div class="operation">
    <el-dialog
      v-model="visible"
      :width="'50%'"
      :close-on-click-modal="false"
      :modal="true"
      :show-close="false"
      :append-to-body="false"     
      
    >
    <ul v-for="(item,index) in list" :key="index">
        <li @click="columnClick(item)">{{item}}</li>
    </ul>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">取消</el-button>
      </div>
    </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
    props:{
        visible:Boolean,
        list:Array
    },methods:{
        close(){
            this.$emit("update:visible", false);
        },
        columnClick(name){
            this.$emit('operationClick',name)
        }
    }
}
</script>

<style lang="scss" scoped>
.operation{
  ::v-deep .el-dialog{
    background-color: var(--bgColor) !important;
  }

  ul,li{
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li{
    margin: 10px;
    color: var(--text-color);
    font-size: 15px;
    text-align: center;
  }

  ::v-deep .el-dialog__body{
    padding: 0;
  }

  .el-button{
    width: 100%;
    background-color:var(--botton-bgColor);
    color: var(--text-color);
  }

  ::v-deep .el-dialog{
    top: 50% !important; /* 使弹窗在页面垂直居中 */
    transform: translateY(-50%); /* 将弹窗向上移动自身高度的一半 */
  }
}
</style>