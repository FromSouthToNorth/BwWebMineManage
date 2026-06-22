// 隔行变色
export function tableRowClassName({ row, rowIndex }) {
  if (rowIndex % 2 == 0) {
    return "oddColor";
  } else {
    return "evenColor";
  }
}
