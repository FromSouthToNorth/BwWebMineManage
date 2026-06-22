/**
 * 人员定位模块工具函数
 */

/**
 * 处理API响应数据
 * @param {Object} response - API响应对象
 * @param {Function} successCallback - 成功回调函数
 * @param {Function} errorCallback - 错误回调函数
 * @param {Function} finallyCallback - 最终回调函数
 */
export const handleApiResponse = (response, successCallback, errorCallback, finallyCallback) => {
  try {
    if (response && response.data) {
      successCallback(response.data);
    } else {
      errorCallback(new Error('Invalid response format'));
    }
  } catch (error) {
    errorCallback(error);
  } finally {
    if (finallyCallback) {
      finallyCallback();
    }
  }
};

/**
 * 格式化日期时间
 * @param {Date|string} date - 日期对象或日期字符串
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
export const formatterDate = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 获取当前日期时间
 * @returns {string} 当前日期时间字符串
 */
export const getCurrDateTime = () => {
  return formatterDate(new Date());
};

/**
 * 转换对象键名（首字母大写）
 * @param {Object} obj - 要转换的对象
 * @returns {Object} 转换后的对象
 */
export const transitionKeyUp = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  Object.keys(obj).forEach(key => {
    const newKey = key.charAt(0).toUpperCase() + key.slice(1);
    result[newKey] = obj[key];
  });
  return result;
};

/**
 * 构建查询参数对象
 * @param {Object} formData - 表单数据
 * @param {Array} formConfig - 表单配置
 * @returns {Object} 构建后的查询参数
 */
export const buildQueryParams = (formData, formConfig) => {
  const params = {};
  
  formConfig.forEach(item => {
    if (formData[item.param] !== undefined && formData[item.param] !== null && formData[item.param] !== '') {
      params[item.param] = formData[item.param];
    }
  });
  
  return params;
};

/**
 * 处理表格列点击事件
 * @param {Object} row - 当前行数据
 * @param {string} clickContent - 点击内容
 * @param {string} label - 列标签
 * @param {Object} vm - 组件实例
 * @param {Object} popupRefs - 弹窗引用对象
 */
export const handleColumnClick = (row, clickContent, label, vm, popupRefs) => {
  vm.table.currentRow = row;
  
  switch (label) {
    case '人数':
      if (popupRefs.downUserNumInfoPopup) {
        popupRefs.downUserNumInfoPopup.show(row, vm.downUserType);
      }
      break;
    case '姓名':
      vm.$router.push({
        path: '/userinfo',
        query: {
          Username: row.UserName,
          workNum: row.WorkNumber,
          SenderID: row.SenderID,
        },
      });
      break;
    default:
      break;
  }
};

/**
 * 处理操作按钮点击事件
 * @param {Object} row - 当前行数据
 * @param {string} value - 按钮文本
 * @param {Object} vm - 组件实例
 * @param {Object} popupRefs - 弹窗引用对象
 */
export const handleOperationClick = (row, value, vm, popupRefs) => {
  vm.table.currentRow = row;
  
  switch (value) {
    case '轨迹':
      if (popupRefs.trackInfoPopup) {
        popupRefs.trackInfoPopup.show(row);
      }
      break;
    case '人员':
      if (popupRefs.userInfoPopup) {
        popupRefs.userInfoPopup.show(row);
      }
      break;
    default:
      break;
  }
};