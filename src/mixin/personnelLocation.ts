import { usePersonnelLocation } from '@/composables/usePersonnelLocation'
import type { ComponentOptionsMixin } from 'vue'

/**
 * 人员定位通用混入
 *
 * 新代码推荐使用 usePersonnelLocation() composable 替代：
 *   import { usePersonnelLocation } from '@/composables/usePersonnelLocation'
 *   const { showPopup, table, search, pageChange, ... } = usePersonnelLocation(loadData)
 *
 * @deprecated 优先使用 usePersonnelLocation() composable
 */
const personnelLocation: ComponentOptionsMixin = {
  setup() {
    const { showPopup, table, selectionChange, pageFieldConvert, addDefaultParam } =
      usePersonnelLocation()
    return { showPopup, table, selectionChange, pageFieldConvert, addDefaultParam }
  },
  methods: {
    /** 触发查询（委托给组件自己的 loadData） */
    search(result: any) {
      ;(this as any).loadData(result)
    },
    /** 分页改变事件 */
    pageChange(result: { currentPage: number; pageSize: number }) {
      const param = {
        ...(this as any).table.queryParam,
        ...(this as any).pageFieldConvert(result),
      }
      ;(this as any).loadData(param)
    },
  },
}

export default personnelLocation
