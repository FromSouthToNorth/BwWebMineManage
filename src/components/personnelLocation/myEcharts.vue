<template>
  <div class="mycharts">    
    <div id="line"></div>
    <div id="bar"></div>
  </div>
</template>

<script>

import {getYear,getinitBar,GetinitLine} from "@/views/personnel_location/downholeInfoJs";
export default {
    name:"myEcharts",
    components:{},
    props:{
        line:{
            type:Boolean,
            default:true
        },
        bar:{
            type:Boolean,
            default:true
        },
        lineXData:Array,
        lineYData:Array,
        barXData:Array,
        barYData:Array

    },
    data(){
        return{

        }
    },
    mounted(){
        this.initEchart();
    },
    methods:{       
        initEchart(){
            if(this.line){
                GetinitLine(this,document.getElementById("line"))
            }
            if(this.bar){

            }
        }
    }
}
</script>

<style lang="scss" scoped>
.mycharts{
  display: flex;
  flex-direction: column;

  #line,#bar{
    flex: 1;

    /* width: 100%; */
    border: 1px solid red;
  }
}

</style>