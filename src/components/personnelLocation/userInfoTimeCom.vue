<template>
  <div class="timebox">
    <div class="pagetitle">
      {{ title }}
    </div>
    <div class="content">
      <div class="content" v-for="item in content" :key="item.title" :class="item.title=='累计时长'?'ljsc':''">
        <div v-if="item.title!='累计时长'">
            <div class="value">{{item.value}}</div>
            <div class="title">{{item.title}}</div>
        </div>
        <div v-else>
            <div class="time">
                <span>{{time.HH}}</span>时
                <span>{{time.mm}}</span>分
                <span>{{time.ss}}</span>秒
            </div>
            <div class="title">
                <span>{{item.title}}</span>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "userInfoTimeCom",
  props: {
    title: {
      type: String,
      default() {
        return "累计下井时长";
      },
    },
    content: {
      type: Array,
      default() {
        return [
          { title: "班次", value: "-" },
          { title: "累计次数", value: "0" },
          { title: "累计时长", value: "0" },
        ];
      },
    },
    time:{
      type:Object,
      default(){
        return {HH:0,mm:0,ss:0}
      }
    }
  },
/*   data() {
    return {

    };
  }, */
/*   mounted() {
    this.content.forEach(item=>{
      if(item.title=="累计时长"){
        this.HH=item.value.substring(0,item.value.indexOf('时'))
        this.mm=item.value.substring(item.value.indexOf('时')+1,item.value.indexOf('分'))
        this.ss=item.value.substring(item.value.indexOf('分')+1,item.value.indexOf('秒'))
      }
    })
  },
  updated(){

  } */
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/root.scss";

.timebox{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  background-color: var(--count-bgColor);
  color: var(--text-color);

  .pagetitle{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 41px;
    // background: #0d303e;
    background: var(--table-headerBgColor);
    color: var(--text-color);
    font-size: 18px;
  }

  .content{
    display: flex;
    justify-content: space-around;
    width: 100%;
    height: 100%;

    .value{
      margin-bottom:10px ;
      color: var(--count-textColor);
      font-size: 20px;
    }

    .time{
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 10px;

      span{
        color: var(--count-textColor);
        font-size: 20px;
      }
    }

    .content{
      flex: 1;
      margin: 16px;
      text-align: center;
    }

    .ljsc{
      flex: 2;
    }
  }

}
</style>>
