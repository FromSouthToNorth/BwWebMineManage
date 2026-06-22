import { usePersonnelLocation } from '@/composables/usePersonnelLocation'

/**
 * 人员定位通用混入
 *
 * 新代码推荐使用 usePersonnelLocation() composable 替代：
 *   import { usePersonnelLocation } from '@/composables/usePersonnelLocation'
 *   const { showPopup, table, search, pageChange, ... } = usePersonnelLocation(loadData)
 *
 * @deprecated 优先使用 usePersonnelLocation() composable
 */
const personnelLocation = {
  setup() {
    // 从 composable 获取状态和纯工具方法（不含依赖 this.loadData 的 search/pageChange）
    const { showPopup, table, selectionChange, pageFieldConvert, addDefaultParam } =
      usePersonnelLocation()
    return { showPopup, table, selectionChange, pageFieldConvert, addDefaultParam }
  },
  methods: {
    /** 触发查询（委托给组件自己的 loadData） */
    search(result) {
      this.loadData(result)
    },
    /** 分页改变事件 */
    pageChange(result) {
      const param = {
        ...this.table.queryParam,
        ...this.pageFieldConvert(result),
      }
      this.loadData(param)
    },
  },
}
export default personnelLocation
