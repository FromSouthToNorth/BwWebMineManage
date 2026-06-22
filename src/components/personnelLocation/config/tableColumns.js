/**
 * 人员定位模块表格列配置
 */

// 井下人员查询 - 分类查询
export const downUserQueryClo = [
  {
    label: "部门",
    prop: "type",
    width: 800,
  },
  {
    label: "人数",
    prop: "userNum",
    isEvent: true,
    color: "var(--highlight-color)",
  },
];

// 井下人员查询 - 分类查询 - 人数详情
export const downUserQueryInfoClo = [
  {
    label: "#",
    prop: "num",
  },
  {
    label: "姓名",
    prop: "UserName",
    isEvent: true,
  },
  {
    label: "工号",
    prop: "WorkNumber",
  },
  {
    label: "卡号",
    prop: "SenderID",
  },
  {
    label: "部门",
    prop: "Department",
  },
  {
    label: "职务",
    prop: "Rank",
  },
  {
    label: "工种",
    prop: "WorkType",
  },
  {
    label: "所在区域",
    prop: "AreaName",
  },
  {
    label: "当前位置",
    prop: "DevicePosition",
    width: 180,
  },
  {
    label: "距离",
    prop: "Direction",
  },
  {
    label: "下井时间",
    prop: "DownWellTime",
    width: 180,
  },
  {
    label: "班次",
    prop: "Shift",
  },
];

// 井下人员查询 - 自定义查询
export const downUserQueryCustomClo = [
  {
    label: "#",
    prop: "num",
  },
  {
    label: "姓名",
    prop: "UserName",
    isEvent: true,
  },
  {
    label: "工号",
    prop: "WorkNumber",
  },
  {
    label: "卡号",
    prop: "SenderID",
  },
  {
    label: "部门",
    prop: "Department",
    width: 120,
  },
  {
    label: "职务",
    prop: "Rank",
  },
  {
    label: "工种",
    prop: "WorkType",
    width: 150,
  },
  {
    label: "所在区域",
    prop: "AreaName",
    width: 200,
  },
  {
    label: "当前位置",
    prop: "DevicePosition",
    width: 180,
  },
  {
    label: "距离",
    prop: "Direction",
  },
  {
    label: "下井时间",
    prop: "DownWellTime",
    width: 180,
  },
  {
    label: "班次",
    prop: "Shift",
  },
  {
    label: "操作",
    prop: "edit",
    columnType: true,
    isEvent: true,
    width: 100,
    slots: [
      {
        soltName: "gj",
        data: "轨迹",
        isInMore: false,
      },
      {
        soltName: "ry",
        data: "人员",
        isInMore: false,
      },
    ],
  },
];

// 表单配置
export const formConfigs = {
  // 分类查询表单
  downUserQueryItem: {
    item: [
      {
        type: "select",
        selectOptions: [
          {
            name: "区域",
            value: "区域",
          },
          {
            name: "读卡器",
            value: "读卡器",
          },
          {
            name: "部门",
            value: "部门",
          },
          {
            name: "职务",
            value: "职务",
          },
          {
            name: "工种",
            value: "工种",
          },
        ],
        placeholder: "选择类型",
        param: "type",
        label: "类型",
        defaultSelect: "部门",
      },
    ],
    customBtn: [
      {
        soltName: "query",
        btnName: "自定义查询",
      },
    ],
  },
  
  // 自定义查询表单
  downUserQueryCustomItem: {
    item: [
      {
        type: "select",
        selectOptions: [],
        placeholder: "选择部门",
        param: "department",
        label: "部门",
      },
      {
        type: "select",
        selectOptions: [],
        placeholder: "选择工种",
        param: "workType",
        label: "工种",
      },
      {
        type: "select",
        selectOptions: [],
        placeholder: "选择位置",
        param: "devicePosition",
        label: "位置",
      },
      {
        type: "select",
        selectOptions: [],
        placeholder: "选择职务",
        param: "rank",
        label: "职务",
      },
      {
        type: "select",
        selectOptions: [],
        placeholder: "选择区域",
        param: "areaName",
        label: "区域",
      },
      {
        type: "input",
        placeholder: "输入班次",
        param: "shift",
        label: "班次",
      },
      {
        type: "input",
        placeholder: "输入姓名",
        param: "userName",
        label: "姓名",
      },
      {
        type: "input",
        placeholder: "输入工号",
        param: "workNumber",
        label: "工号",
      },
      {
        type: "input",
        placeholder: "输入卡号",
        param: "senderID",
        label: "卡号",
      },
    ],
    customBtn: [
      {
        soltName: "query",
        btnName: "分类查询",
      },
    ],
  },
};