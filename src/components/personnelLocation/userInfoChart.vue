<template>
  <div class="box" :style="{ width: '100%', height: chartHeight + 'px' }">
    <MyChartHeader :title="`${year}年累计下井时长`" />
    <div
      id="chart"
      :style="{ width: '100%', height: chartHeight - 40 + 'px' }"
    ></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import MyChartHeader from "@/components/personnelLocation/echartsHeader.vue";
import { DATA_THEME } from "@/store/mutation-types";
let MyChart;
export default {
  name: "userInfoEchart",
  components: { MyChartHeader },
  props: {
    year: {
      type: [String, Number],
    },
    value: [String, Number],
  },
  data() {
    return {
      clientHeight: 0,
      clientWidth: 0,
    };
  },
  created() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateDimensions);
  },
  computed: {
    chartHeight() {
      return Math.max(300, Math.min(this.clientHeight * 0.3, 400));
    },
  },
  mounted() {
    setTimeout(() => {
      this.initChart();
    }, 500);
  },
  methods: {
    updateDimensions() {
      this.clientHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      this.clientWidth =
        document.documentElement.clientWidth || document.body.clientWidth;
      if (MyChart) {
        MyChart.resize();
      }
    },
    initChart() {
      /* 存在实例则销毁 */
      if (MyChart != null && MyChart != "" && MyChart != undefined) {
        MyChart.dispose(); //销毁
      }
      // 图表高宽自适应
      // window.addEventListener("resize", () => {
      //   MyChart.resize();
      // });
      let chartDom = document.getElementById("chart");
      MyChart = echarts.init(chartDom);

      const color = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        {
          offset: 0,
          color: "rgba(101, 200, 255, 1)",
        },
        {
          offset: 1,
          color: "rgba(22, 62, 167, 1)",
        },
      ]);
      const colorSet = [
        [0, color],
        [
          1,
          localStorage.getItem(DATA_THEME) == "light" ? "#f2f4f5" : "#1f394f",
        ],
      ];
      let option = {
        series: [
          {
            type: "gauge",
            startAngle: 210,
            endAngle: -30,
            min: 0,
            max: 100,
            splitNumber: 12,
            radius: "100%",
            itemStyle: {
              color: "#58D9F9",
              shadowColor: "rgba(0,138,255,0.45)",
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
            /* 图表居中 */
            center: ["50%", "65%"], // 调整图表中心位置
            progress: {
              show: true,
              /* 圆角 */
              roundCap: true,
              width: 12, // 减小进度条宽度
            },
            pointer: {
              show: false,
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 12, // 减小轴线宽度
                color: colorSet,
              },
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            detail: {
              // 中间数据
              valueAnimation: true,
              formatter: "{value}%", // 数据值的样式
              textStyle: {
                fontSize: 28, // 进一步减小字体大小
                color: "rgba(248, 196, 62, 1)",
                fontWeight: "bold",
              },
              offsetCenter: [0, "-20%"], // 调整中间值的位置
            },
            title: {
              // 标题位置
              offsetCenter: [0, "35%"],
              textStyle: {
                fontSize: 15, // 进一步减小字体大小
                color: "rgba(255, 255, 255, 0.8)",
              },
            },
            data: [
              {
                value: this.value,
                name: "超越用户",
              },
            ],
          },
        ],
      };
      MyChart.setOption(option);
    },
  },
};
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
}
</style>
