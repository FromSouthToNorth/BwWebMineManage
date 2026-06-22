<template>
  <div class="devState">
    <div class="header">
        <headerApp :isScreen="true" :list="[]" @screen="screen" />
    </div>
    <div class="table">
        <my-table
        :tableData="tableData"
        :tableColumnOptions="tableCol"
        :paginationShow="true"
        :tableDataTotal="total"
        :small="true"
        :pagerCount="5"
        :layOut="'total, prev, pager, next'"
        :loading="loading"
        ref="myTable"
        @tableUpdate="pageChange"
      />
    </div>
    <myDrawer
      :drawer="drawer"
      :content="formItemList"
      :title="'条件筛选'"
      @handleClose="handleClose"
      @search="search"
    />
  </div>
</template>

<script>
import headerApp from "@/components/personnelLocation/header_app.vue";
import MyTable from "@/components/personnelLocation/tableComponent.vue";
import myDrawer from "@/components/personnelLocation/myDrawer.vue";
import {
  getPolicy2572,
  getPolicy5400
} from "@/api/system/personnelLocation";
import {getInitDate} from "@/views/personnel_location/downholeInfoJs"
export default {
    name:"devState",
    components:{headerApp,MyTable,myDrawer},
    data(){
        return{
            tableData:[],
            tableCol:[
                {
                    label:"#",
                    prop:"num"
                },
                {
                    label:"报警类型",
                    prop:"AlarmType"
                },
                {
                    label:"设备编号",
                    prop:"Number"
                },
                {
                    label:"设备名称",
                    prop:"Name",
                    width:150
                },
                {
                    label:"报警内容",
                    prop:"Remarks",
                    width:150
                },
                {
                    label:"报警时间",
                    prop:"StartTime",
                    width:150
                },
                {
                    label:"结束时间",
                    prop:"EndTime",
                    width:150
                },
            ],
            total:0,
            loading:false,
            drawer:false,
            formItemList:[
                {
                    type: "datetime",
                    param: "StartTime",
                    label: "开始时间",
                    defaultSelect:''
                },
                {
                    type: "datetime",
                    param: "EndTime",
                    label: "结束时间",
                    defaultSelect:''
                },
                {
                    type: "select",
                    param: "AlarmType",
                    selectOptions:[],
                    label: "报警类型",
                },
                {
                    type: "input",
                    param: "Remarks",
                    placeholder:"模糊查询",
                    label: "报警内容",
                },
                {
                    type: "input",
                    param: "Name",
                    placeholder:"模糊查询",
                    label: "设备名称",
                },

            ],
            param:{}
        }
    },
    mounted(){
        /* 获取前6天和明天的日期 */
        const date= getInitDate(6)
        this.formItemList[0].defaultSelect=date.StartTime
        this.formItemList[1].defaultSelect=date.EndTime
        this.param.StartTime=date.StartTime
        this.param.EndTime=date.EndTime
        this.getDevHisData(this.param)
    },
    methods:{
        screen(){
            this.getSelectOptions()
            this.drawer=true
        },
        search(result){
            this.param=result
            this.param.Page=1;
            this.Row=20;
            this.drawer=false
            this.$refs.myTable.updateCurrpage()
            this.getDevHisData(this.param)
        },
        handleClose(){
            this.drawer=false
        },
        pageChange(result){
            this.param.Page=result.currentPage
            this.param.Row=result.pageSize
            this.getDevHisData(this.param)
        },
        async getDevHisData(param){
            this.loading=true;
            const {data} =await getPolicy2572(2572,param)
            this.tableData=[];
            if(data.length!=0){
                this.tableData=data[0].data
                this.total=Number(data[0].total)
            }
            this.loading=false;
        },
        async getSelectOptions() {
            const { data } = await getPolicy5400();
            if (data.length != 0) {
                this.formItemList.forEach((item,index)=>{
                if(item.param=='AlarmType'){
                    item.selectOptions = [];
                    item.selectOptions = data[0].Alarmtype;
                }
                })
            }
        },
    }
}
</script>

<style lang="scss" scoped>

</style>
