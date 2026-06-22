<template>
  <div class="box">
    <!-- 菜单栏 -->
    <section class="theme-list">
      <div class="fixed-nav" ref="fixednav">
        <div
          id="fixed-nav-content"
          class="fixed-nav-content"
          ref="menu"
          :scroll-left="scrollLeft"
          :style="{
            width: `${menuWidth < clientWidth ? clientWidth : menuWidth}px`,
          }"
        >
          <span
            v-for="(item, index) in theme"
            :key="index"
            ref="scrollItem"
            :class="['tab-title', activeId === index && 'select-tab']"
            @click="changeTab(index, $event, item.path)"
          >
            {{ item.name }}
          </span>
        </div>
      </div>
    </section>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      theme: [
        {
          name: "人员定位实时信息",
          path: "index_app",
        },
        {
          name: "历史下井信息",
          path: "his_downhole_app",
          children: ["his_downhole_app", "downholeNum_app"],
        },
        {
          name: "下井人员查询",
          path: "downholepersonquery_app",
        },
        {
          name: "人员出勤统计",
          path: "personCount_app",
        },
        {
          name: "设备状态",
          path: "deviceState_app",
        },
      ],
      activeId: 0,
      clientHeight: 0,
      clientWidth: 0,
      menuWidth: 0,
      scrollLeft: 0,
    };
  },
  mounted() {
    /* 刷新时 菜单栏设置为刷新前的菜单*/
    this.theme.forEach((item, index) => {
      if (item.children) {
        item.children.forEach((item1) => {
          if (item1 == this.$route.name) {
            this.activeId = index;
          }
        });
      } else {
        if (item.path == this.$route.name) {
          this.activeId = index;
        }
      }
    });

    var divs = document.getElementsByClassName("tab-title");
    for (var i = 0; i < divs.length; i++) {
      this.menuWidth += divs[i].offsetWidth + 12;
    }
  },
  created() {
    let h = document.documentElement.clientHeight || document.body.clientHeight;
    this.clientWidth =
      document.documentElement.clientWidth || document.body.clientWidth;
    /* 解决苹果输入框获取焦点时页面放大的问题 */
    const meta = document.createElement("meta");
    meta.content = "yes";
    meta.name = "apple-mobile-web-app-capable";
    document.getElementsByTagName("head")[0].appendChild(meta);
    document
      .querySelector("meta[name=viewport]")
      .setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );
  },

  watch: {
    $route: {
      handler(val, oldVal) {
        let str = val.name;
        this.theme.forEach((item, index) => {
          if (item.path == str) {
            this.activeId = index;
          }
        });
      },
    },
  },
  methods: {
    changeTab(id, event, path) {
      if (id !== this.activeId) {
        this.activeId = id;
        const spanLeft = event.clientX;
        const divBox = document.querySelector(".select-tab").clientWidth / 2;
        const totalWidths = document.body.clientWidth;
        const widths = totalWidths / 2;
        const spanRight = totalWidths - spanLeft;
        const scrollBox = document.querySelector(".fixed-nav");
        const scrollL = scrollBox.scrollLeft;
        if (spanRight < 100 || spanLeft < 100) {
          scrollBox.scrollLeft = scrollL + (spanLeft - widths) + divBox;
        }
        this.$router.push({ name: path });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100%;
  background-color: var(--bgColor);
  color: var(--textColor);

  .theme-list {
    position: relative;
    z-index: 100;
    height: auto;
    box-shadow: 0 4px 8px 0 rgb(37 39 56 / 6%);
  }

  .fixed-nav {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .fixed-nav-content {
    display: flex;
    align-items: center;
    height: 36px;
    background-color: var(--menu-bgColor);
  }

  .tab-title {
    flex-shrink: 0;
    height: 36px;
    padding: 0 13px;
    color: var(--menu-color);
    font-size: 14px;
    line-height: 36px;
  }

  .select-tab {
    color: var(--menu-active-color);
  }

  ::-webkit-scrollbar {
    display: none;
    width: .01rem;
    opacity: 0;
  }

  ::-webkit-scrollbar-track {
    opacity: 0;
    background-color: #fff;
  }

  ::-webkit-scrollbar-thumb {
    width: .01rem;
    border-radius: .01rem;
    opacity: 0;
  }
}

::v-deep .el-dialog {
  border: 1px;
  border-radius: 10px;
  background: var(--user-popup-contentBgColor);
}

::v-deep .el-dialog__title {
  color: var(--text-color) !important;
}

::v-deep .el-dialog__body {
  padding: 10px;
}
</style>
