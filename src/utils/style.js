// 隔行变色
export function tableRowClassName({ row, rowIndex }) {
  if (rowIndex % 2 == 0) {
    return "oddColor";
  } else {
    return "evenColor";
  }
}

const rootElement = document.documentElement;
const ComputedStyle = getComputedStyle(rootElement);

export function getPropertyValue() {
  return ComputedStyle.getPropertyValue("--text-color");
}
