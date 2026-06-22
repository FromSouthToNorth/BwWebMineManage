import { mapState } from 'vuex';

/**
 * APP版本通用混合器
 */
export const AppMixin = {
  computed: {
    ...mapState({
      orientation: (state) => state.LocationInfo.orientation,
    }),
  },
  watch: {
    orientation(newVal, oldVal) {
      console.log(newVal, oldVal);
      // 当屏幕方向发生变化时，执行相应逻辑
      window.location.reload();
    },
  },
  methods: {
    /**
     * 获取屏幕高度
     */
    getClientHeight() {
      return document.documentElement.clientHeight || document.body.clientHeight;
    },
    
    /**
     * 初始化屏幕高度监听
     */
    initClientHeight() {
      this.clientHeight = this.getClientHeight();
      window.addEventListener('resize', () => {
        this.clientHeight = this.getClientHeight();
      });
    },
    
    /**
     * 处理触摸滑动事件
     * @param {Object} e - 触摸事件对象
     */
    touchstart(e) {
      /* 记录初始位置 */
      this.startX = e.touches[0].pageX;
      this.startY = e.touches[0].pageY;
    },
    
    /**
     * 处理触摸移动事件
     * @param {Object} e - 触摸事件对象
     */
    touchmove(e) {
      /* 判断是否滚动 */
      this.isMove = true;
      /* 监听滑动最终结束的位置 */
      this.endX = e.touches[0].pageX;
      this.endY = e.touches[0].pageY;
    },
    
    /**
     * 处理触摸结束事件
     * @param {Function} callback - 回调函数，接收方向参数（left/right）
     */
    touchend(callback) {
      /* 判断移动方向 */
      let X = this.endX - this.startX,
        Y = this.endY - this.startY;
      
      /* 判断是否移动还是点击 */
      if (this.isMove) {
        if (X > 0 && Math.abs(X) > Math.abs(Y)) {
          // 向右
          callback && callback('right');
        } else if (X < 0 && Math.abs(X) > Math.abs(Y)) {
          // 向左
          callback && callback('left');
        }
        this.isMove = false;
      }
    },
    
    /**
     * 计算总页数
     * @param {Array} data - 数据数组
     * @param {number} size - 每页大小
     * @returns {number} 总页数
     */
    calculateTotalPages(data, size) {
      return data.length % size === 0
        ? data.length / size
        : Math.ceil(data.length / size);
    },
  },
};

/**
 * 处理分页逻辑的混合器
 */
export const PaginationMixin = {
  data() {
    return {
      page: 1,
      size: 10,
      total: 0,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isMove: false,
    };
  },
  methods: {
    /**
     * 处理分页滑动
     * @param {string} direction - 滑动方向
     */
    handlePagination(direction) {
      if (direction === 'right') {
        if (this.page <= 1) {
          return;
        }
        this.page--;
      } else if (direction === 'left') {
        if (this.page >= this.total) {
          this.$message({
            message: '没有数据了',
            duration: 1000,
          });
          return;
        }
        this.page++;
      }
      
      if (this.page > 0 && this.page <= this.total) {
        this.initBar();
      }
    },
    
    /**
     * 下一页
     */
    dataClickNext() {
      if (this.page < this.total) {
        this.page++;
        this.initBar();
      }
    },
    
    /**
     * 上一页
     */
    dataClickNev() {
      if (this.page > 1) {
        this.page--;
        this.initBar();
      }
    },
  },
};