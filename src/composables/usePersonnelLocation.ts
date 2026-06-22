import { reactive, ref } from 'vue'

/** 表格状态 */
export interface TableState {
  dataSource: any[]
  total: number
  pageNo: number
  pageSize: number
  loading: boolean
  queryParam: Record<string, any>
  currentRow: any
  selectedRowKeys: any[]
  selectedRows: any[]
}

export function usePersonnelLocation() {
  const showPopup = ref(false)

  const table = reactive<TableState>({
    dataSource: [],
    total: 0,
    pageNo: 1,
    pageSize: 20,
    loading: false,
    queryParam: {},
    currentRow: {},
    selectedRowKeys: [],
    selectedRows: [],
  })

  /** 表格选中事件 */
  function selectionChange(rows: any[]) {
    table.selectedRows = rows
  }

  /**
   * 将分页组件返回的字段转换为策略 API 需要的分页字段
   */
  function pageFieldConvert(result: { currentPage: number; pageSize: number }) {
    return { Page: result.currentPage, Row: result.pageSize }
  }

  /**
   * 为查询参数追加分页默认值（仅当不存在时）
   */
  function addDefaultParam(queryParam?: Record<string, any>): Record<string, any> {
    const param = queryParam ?? {}
    if (param.Page == null) param.Page = table.pageNo
    if (param.Row == null) param.Row = table.pageSize
    return param
  }

  return {
    showPopup,
    table,
    selectionChange,
    pageFieldConvert,
    addDefaultParam,
  }
}
