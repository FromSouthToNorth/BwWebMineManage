<template>
  <div class="user-info-count">
    <headerApp
    :isScreen="false"
    :list="[]"
    />
    <div class="chart" :style="{width:'100%',height:`${_cliHeight/3}`}">
      <MyUserInfoChart :year="params.year" :value="chartVal" :key="chartVal" />
    </div>
    <div class="count" :style="{width:'100%',height:`${_cliHeight/3}`}">
      <MyUserInfoTime
        ref="infoTime"
        :title="'累计下井时长'"
        :content="content1"
        :time="time"
        :key="new Date().getTime()"
      />
      <div class="bottom">
        <el-row :span="24">
          <el-col class="hj" :span="3">
            <div>合计</div>
          </el-col>
          <el-col :span="7">
            <span class="title">累计次数</span>
            <span class="value">{{ count }}</span>
          </el-col>
          <el-col :span="13">
            <span class="title">累计时长</span>
            <span class="value">{{ time.HH }}</span>
            <span class="text">时</span>
            <span class="value">{{ time.mm }}</span>
            <span class="text">分</span>
            <span class="value">{{ time.ss }}</span>
            <span class="text">秒</span>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="count" :style="{width:'100%',height:`${_cliHeight/3}`}">
      <MyUserInfoTime
        ref="infoTime"
        :title="'下井时长超时'"
        :content="content2"
        :key="new Date().getTime()"
      />
      <div class="bottom">
        <el-row :span="24">
          <el-col class="hj" :span="3">
            <div>合计</div>
          </el-col>
          <el-col :span="21">
            <span class="title">超时次数</span>
            <span class="value">{{ timeout }}</span>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import headerApp from "@/components/personnelLocation/header_app.vue";
import MyUserInfoTime from "@/components/personnelLocation/userInfoTimeCom.vue";
import MyUserInfoChart from "@/components/personnelLocation/userInfoChart.vue";
import { getpolicy, } from "@/api/system/personnelLocation";
export default {
 components: {
    MyUserInfoTime,
    MyUserInfoChart,
    headerApp
  },
  data() {
    return {
      content1: [
        { title: "班次", value: "-" },
        { title: "累计次数", value: 0 },
        { title: "累计时长", value: "0时0分0秒" },
      ],
      content2: [],
      time: {
        HH: 0,
        mm: 0,
        ss: 0,
      },
      timeout: 0,
      count: 0,
      year: "",
      chartVal: 0,
      params: {},
      _cliHeight: 0,
    };
  },
  mounted(){
    this._cliHeight = document.documentElement.clientHeight || document.body.clientHeight;
    this.params=this.$route.query
    this.axiosAll()
  },
  methods:{
    getpolyc5320(){
      getpolicy(5320,this.params).then(({data})=>{
        if (data.length != 0) {
          let count=0
          data.forEach(item=>{
            count+=item.timeout
          })
            this.content2 = [
              { title: "班次", value: "-" },
              { title: "超时次数", value: count },
            ];
            this.timeout = count;
          }
      })
    },
    getpolyc5287(){
      getpolicy(5287,this.params).then(({data})=>{
         this.time=this.$options.data.call().time
         this.content1=this.$options.data.call().content1
         this.count=0;
         if (data.length != 0) {
          let downTime=data[0].downTime;
            this.content1.forEach((item,index) => {
              if (item.title == "累计时长") {
                this.time.HH = downTime.substring(0, downTime.indexOf("时"));
                this.time.mm = downTime.substring(
                  downTime.indexOf("时") + 1,
                  downTime.indexOf("分")
                );
                this.time.ss = downTime.substring(
                  downTime.indexOf("分") + 1,
                  downTime.indexOf("秒")
                );
              }else if(item.title == "累计次数"){
                this.count=data[0].count
                this.content1[index].value=data[0].count
              }
            });
          }
      })
    },
    getpolyc5288(){
      getpolicy(5288, this.params).then(({data})=>{
        this.chartVal = 0;
        if (data.length != 0) {
            data.forEach((item) => {
              this.chartVal = item.value;
            });
          }
      })
    },
    axiosAll(){
        this.getpolyc5288();
        this.getpolyc5320();
        this.getpolyc5287();
    }
  }
};
</script>

<style lang="scss" scoped>
.user-info-count{
  height: 94%;
  background-color: var(--chart-bgColor);

  .chart{
    flex: 2;
  }

  div {
    flex: 1;
  }

  .count {
    margin-bottom: 20px;
    color: var(--text-color);

    .bottom {
      display: flex;
      justify-content: space-around;
    }

    .hj {
      border-right: 1px solid var(--count-borderColor);
    }

    .el-row {
      border-top: 1px solid var(--count-borderColor);
      background: var(--count-bgColor);
      font-size: 15px;

      .el-col {
        height: 100%;
        line-height: 30px;
        text-align: center;

        .title {
          margin-right: 5px;
        }

        .value {
          color: var(--count-textColor);
          font-size: 16px;
        }

        .text {
          margin: 0 5px;
          color: var(--count-bottomtext);
          font-size: 12px;
        }
      }
    }
  }
}
</style>
