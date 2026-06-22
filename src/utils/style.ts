interface RowClassNameParams {
  row: any
  rowIndex: number
}

/** 隔行变色 */
export function tableRowClassName({ rowIndex }: RowClassNameParams): string {
  if (rowIndex % 2 === 0) {
    return 'oddColor'
  }
  return 'evenColor'
}
