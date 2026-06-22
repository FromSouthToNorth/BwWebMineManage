<template>
  <div class="persionNum personnel-page">
    <myheader :title="title" :showQuery="true" :showTab="false" @query="typeChange" />
    <div class="title">{{ params.year }}-{{ params.month }}-{{ params.day }} 下井人数 {{ total }} 人</div>
    <div id="persionBar"></div>
  </div>
</template>

<script>
import myheader from '@/components/personnelLocation/header.vue'
import { getinitBar } from './downholeInfoJs'
import { getpolicy5264 } from '@/api/system/personnelLocation'

export default {
  name: 'DownholepersonNum',
  components: { myheader },
  data() {
    return {
      title: '人员定位历史下井信息',
      barXData: [],
      barYData: [],
      params: {},
      type: '部门',
      year: '',
      month: '',
      day: '',
      total: 0,
    }
  },
  created() {
    this.params = this.$route.params
    this.year = this.$route.params.year
    this.month = this.$route.params.month
    this.day = this.$route.params.day
    this.getdata()
  },
  watch: {
    immediate: true,
    barXData: function (val) {
      this.initBar()
    },
  },
  methods: {
    initBar() {
      let routeInfo = {
        path: 'turnOutInfo',
        param: { year: this.year, month: this.month, day: this.day, type: this.type },
      }
      routeInfo.param.type = this.type
      getinitBar(this, document.getElementById('persionBar'), '人数', routeInfo)
    },
    async getdata() {
      let date = this.params
      let par = {
        month: `${date.year}${date.month < 10 ? '0' + date.month : date.month}`,
        day: `${date.year}-${date.month}-${date.day}`,
        type: this.type,
      }
      const { data } = await getpolicy5264(5264, par)
      if (data.length != 0) {
        this.barXData = []
        this.barYData = []
        this.total = 0
        data.forEach((item) => {
          this.barXData.push(item.ch == null ? '空' : item.ch)
          this.barYData.push(item.num)
          this.total += item.num
        })
      }
    },
    typeChange(result) {
      this.type = result.typeName
      this.getdata()
    },
  },
}
</script>

<style lang="scss" scoped>
.persionNum {
  width: 100%;
  height: 100%;
  padding: 10px;

  .title {
    color: var(--text-color);
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }

  #persionBar {
    width: 100%;
    height: 90%;
    border-radius: 10px;
    background: var(--chart-bgColor);
  }
}
</style>
