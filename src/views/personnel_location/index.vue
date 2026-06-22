<template>
  <el-container ref="container" class="presonnel personnel-page">
    <el-header>
      <div class="header-info">
        <div class="header-info-left">
          <div class="location-info">
            <span>人员定位实时信息</span>
          </div>
          <div class="loca-number">
            <span class="title">下井人数</span>
            <span class="fg"></span>
            <span class="day">当前:<span>{{ currentDownholeNum }}</span></span>
            <span class="day">当天:<span>{{ dayDownholeNum }}</span></span>
          </div>
        </div>
        <div class="header-info-right">
          <div class="warn">
            <div>
              当前设备报警数 <span class="warn-num">{{ devicePoliceNum }}</span>台
            </div>
            <div>
              当前人员报警数 <span class="warn-num">{{ userPoliceNum }}</span>人
            </div>
            <div>
              <img src="../../assets/icon/mini.png" style="width: 25px; height: 25px" />
            </div>
          </div>
          <div class="btn" v-for="item in headerBtn" :key="item.text">
            <router-link :to="item.path">
              <el-button type="primary" size="small" @click="btnClick(item.text)">{{ item.text }}</el-button>
            </router-link>
          </div>
          <div class="btn" v-if="dropdownMenuItem.length != 0">
            <el-dropdown @command="dropdownItemClick" class="dropdown">
              <el-button size="small">
                呼叫控制<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="item in dropdownMenuItem"
                    :key="item.menu_name"
                    :command="item.menu_fun"
                    :class="item.icon"
                  >{{ item.menu_name }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </el-header>
    <main>
      <echart></echart>
    </main>
    <footer>
      <infoList></infoList>
    </footer>
    <!-- 井下人员查询 -->
    <downUserQueryPopup ref="downUserQueryPopup"></downUserQueryPopup>
    <!-- 设备状态 -->
    <deviceStatePopup ref="deviceStatePopup"></deviceStatePopup>
    <!-- 呼叫回电 -->
    <callBackPopup ref="callBackPopup"></callBackPopup>
    <!-- 设备撤离 -->
    <evacuateDevicePopup ref="evacuateDevicePopup"></evacuateDevicePopup>
    <!-- 人员撤离 -->
    <evacuatePersonnelPopup ref="evacuatePersonnelPopup"></evacuatePersonnelPopup>
    <!-- 区域撤离 -->
    <evacuateAreaPopup ref="evacuateAreaPopup"></evacuateAreaPopup>
    <!-- 轨迹信息 -->
    <trackInfoPopup ref="trackInfoPopup"></trackInfoPopup>
    <!-- 个人信息弹窗 -->
    <userInfoPopup ref="userInfoPopup"></userInfoPopup>
  </el-container>
</template>

<script>
import echart from './echarts.vue'
import infoList from './infoList.vue'
import downUserQueryPopup from '@/components/personnelLocation/popups/downUserQueryPopup.vue'
import deviceStatePopup from '@/components/personnelLocation/popups/deviceStatePopup.vue'
import callBackPopup from '@/components/personnelLocation/popups/callBackPopup.vue'
import evacuateDevicePopup from '@/components/personnelLocation/popups/evacuateDevicePopup.vue'
import evacuatePersonnelPopup from '@/components/personnelLocation/popups/evacuatePersonnelPopup.vue'
import evacuateAreaPopup from '@/components/personnelLocation/popups/evacuateAreaPopup.vue'
import trackInfoPopup from '@/components/personnelLocation/popups/trackInfoPopup.vue'
import userInfoPopup from '@/components/personnelLocation/popups/userInfoPopup.vue'
import { GetStrategyJsonData, GetStrategyData } from '@/api/system/personnelLocation'
import { getPolicy5285 } from '@/api/system/personnelLocation'

export default {
  name: 'PersonnelLocationIndex',
  meta: { keepAlive: false },
  components: {
    echart, infoList,
    downUserQueryPopup, deviceStatePopup, callBackPopup,
    evacuateDevicePopup, evacuatePersonnelPopup, evacuateAreaPopup,
    trackInfoPopup, userInfoPopup,
  },
  data() {
    return {
      devicePoliceNum: 0,
      userPoliceNum: 0,
      currentDownholeNum: 0,
      dayDownholeNum: 0,
      headerBtn: [
        { text: '历史下井信息', path: '/downholeinfo' },
        { text: '井下人员查询', path: '' },
        { text: '设备状态', path: '' },
      ],
      dropdownMenuItem: [],
      type: ['当前', '当天'],
      timer: null,
    }
  },
  mounted() {
    this.getWarnData()
    this.GetMenuBtnConfig()
    this.type.forEach((item) => { this.getcurrNum_dayNumData(item) })
  },
  methods: {
    /* 获取报警数据 */
    async getWarnData() {
      const { data } = await GetStrategyJsonData(6794, null)
      this.devicePoliceNum = data.DeviceAlarms
      this.userPoliceNum = data.PersonnelAlarms
    },
    /* 获取当前当天下井人数 */
    async getcurrNum_dayNumData(type) {
      const { data } = await getPolicy5285(type)
      if (type == '当前') {
        this.currentDownholeNum = data[0].num
      } else {
        this.dayDownholeNum = data[0].num
      }
    },
    /* 获取呼叫控制按钮配置 */
    async GetMenuBtnConfig() {
      let JsonData = {
        query: [
          { colname: 'menu_name' }, { colname: 'sortid' },
          { colname: 'menu_fun' }, { colname: 'icon' },
        ],
        condition: [
          { colname: 'menu_type', compare_type: '=', value: 2 },
          { colname: 'is_enable', compare_type: '=', value: 1 },
        ],
      }
      let parameter = [
        { name: 'TableID', value: '761da0015778415ba89a7348dbd1b94f' },
        { name: 'Type', value: 2 },
        { name: 'JsonData', value: JsonData },
      ]
      let { data, code } = await GetStrategyData(5994, parameter)
      if (code != 100) return
      this.dropdownMenuItem = data
    },
    /* 呼叫控制点击事件 */
    dropdownItemClick(action) {
      try {
        const fn = new Function(`return ${action}`)()
        if (typeof fn === 'function') fn(this)
      } catch (error) {
        console.error('执行函数时出错:', error)
      }
    },
    /* 按钮点击事件 */
    btnClick(text) {
      switch (text) {
        case '井下人员查询':
          this.$refs.downUserQueryPopup.show()
          break
        case '设备状态':
          this.$refs.deviceStatePopup.show()
          break
      }
    },
  },
}
</script>

<style scoped lang="scss">
/* 首页头部样式 */
.header-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  height: 100%;

  .header-info-left {
    display: flex;
    flex-wrap: wrap;
    height: 50%;

    .location-info {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      height: 100%;

      span {
        background: var(--textBgColor);
        background-clip: text;
        color: transparent;
        font-size: 30px;
        font-weight: bold;
      }
    }

    .loca-number {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      height: 100%;
      margin-left: 10px;
      padding-right: 5px;
      padding-left: 5px;
      border: 1px solid var(--personDownNum-border);
      border-radius: 4px;
      background: var(--personDownNum-bgColor);
      box-shadow: var(--box-shadow);
      font-size: 14px;

      .fg {
        content: '';
        display: block;
        width: 1px;
        height: 80%;
        margin-right: 10px;
        margin-left: 10px;
        background: var(--personDownNum-fg);
      }

      .day {
        margin-right: 5px;
        span {
          color: var(--personDownNum-numberColor);
          font-size: 18px;
        }
      }
    }
  }

  .header-info-right {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-around;
    height: 50%;

    .warn {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding-left: 5px;
      border: 1px solid var(--warn-borderColor);
      border-radius: 15px;
      background: var(--warn-bgColor);
      color: var(--warn-textColor);
      font-size: 12px;

      img {
        background-color: var(--warn-iconColor);
      }

      div {
        margin-top: 1px;
        margin-right: 2px;
        .warn-num {
          color: var(--warn-numberColor);
          font-size: 18px;
        }
      }
    }

    .btn {
      margin-left: 10px;
    }
  }
}

.presonnel {
  height: 100%;
  overflow: hidden;
}

.el-container {
  display: flex;
  flex-direction: column;
}

main {
  flex: 1 1 auto;
  overflow: auto;
}

footer {
  flex: 0 0 auto;
}
</style>
