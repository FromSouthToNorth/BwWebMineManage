/**
 * 人员定位模块工具函数
 */

export function handleApiResponse(
  response: any,
  successCallback: (data: any) => void,
  errorCallback: (error: Error) => void,
  finallyCallback?: () => void,
): void {
  try {
    if (response && response.data) {
      successCallback(response.data)
    } else {
      errorCallback(new Error('Invalid response format'))
    }
  } catch (error) {
    errorCallback(error as Error)
  } finally {
    if (finallyCallback) {
      finallyCallback()
    }
  }
}

interface PopupRefs {
  downUserNumInfoPopup?: { show: (row: any, type?: string) => void }
  trackInfoPopup?: { show: (row: any) => void }
  userInfoPopup?: { show: (row: any) => void }
  [key: string]: any
}

/**
 * 处理表格列点击事件
 * @param row - 当前行数据
 * @param clickContent - 点击内容
 * @param label - 列标签
 * @param vm - 组件实例
 * @param popupRefs - 弹窗引用对象
 */
export function handleColumnClick(row: any, clickContent: string, label: string, vm: any, popupRefs: PopupRefs): void {
  vm.table.currentRow = row

  switch (label) {
    case '人数':
      if (popupRefs.downUserNumInfoPopup) {
        popupRefs.downUserNumInfoPopup.show(row, vm.downUserType)
      }
      break
    case '姓名':
      vm.$router.push({
        path: '/userinfo',
        query: {
          Username: row.UserName,
          workNum: row.WorkNumber,
          SenderID: row.SenderID,
        },
      })
      break
    default:
      break
  }
}

/**
 * 处理操作按钮点击事件
 * @param row - 当前行数据
 * @param value - 按钮文本
 * @param vm - 组件实例
 * @param popupRefs - 弹窗引用对象
 */
export function handleOperationClick(row: any, value: string, vm: any, popupRefs: PopupRefs): void {
  vm.table.currentRow = row

  switch (value) {
    case '轨迹':
      if (popupRefs.trackInfoPopup) {
        popupRefs.trackInfoPopup.show(row)
      }
      break
    case '人员':
      if (popupRefs.userInfoPopup) {
        popupRefs.userInfoPopup.show(row)
      }
      break
    default:
      break
  }
}
