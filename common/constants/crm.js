export const CUSTOMER_TYPES = [
  { label: '运输', value: 'transport' },
  { label: '清关', value: 'clearance' },
];

export const CRM_ORDER_STATUS = {
  created: 1,
  processing: 2,
  finished: 4,
};

export const CRM_ORDER_MODE = {
  clearance: 'clearance',
  transport: 'transport',
};

export const SCOF_ORDER_TRANSFER = [
  { value: 'IMP', text: '进口', icon: 'login' },
  { value: 'EXP', text: '出口', icon: 'logout' },
  { value: 'DOM', text: '境内流转', icon: 'reload' },
];

export const SCOF_ORDER_TRANSMODES = [
  { value: '2', text: '海运', icon: 'zmdi zmdi-boat' },
  { value: '5', text: '空运', icon: 'zmdi zmdi-airplane' },
  { value: '4', text: '公路', icon: 'zmdi zmdi-truck' },
  { value: '3', text: '铁路', icon: 'zmdi zmdi-subway' },
];

export const SCOF_CONTAINER_TYPE = [
  { value: 'FCL', text: '整箱' },
  { value: 'LCL', text: '拼箱' },
  { value: 'BULK', text: '散货' },
];

export const CRM_BILLING_STATUS = {
  1: '创建未发送',
  2: '已发送,待对方对账',
  3: '待对账',
  4: '已修改,待对方对账',
  5: '接受',
  6: '已开票',
  7: '已核销',
};
