export const CRM_ORDER_STATUS = {
  created: 1,
  processing: 2,
  closed: 3,
  finished: 4,
  cancelled: 5,
};

export const CRM_ORDER_MODE = {
  clearance: 'clearance',
  transport: 'transport',
};

export const SCOF_ORDER_TRANSFER = [
  {
    value: 'IMP', text: '进口订单', icon: 'login', desc: '货物由境外运输入境',
  },
  {
    value: 'EXP', text: '出口订单', icon: 'logout', desc: '货物由境内运输出境',
  },
  {
    value: 'DOM', text: '国内流转', icon: 'reload', desc: '无实际进出境运输',
  },
];

export const TRANS_MODES = [
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

export const WRAP_TYPE = [{
  text: '木箱',
  value: '1',
}, {
  text: '纸箱',
  value: '2',
}, {
  text: '桶装',
  value: '3',
}, {
  text: '散装',
  value: '4',
}, {
  text: '托盘',
  value: '5',
}, {
  text: '包',
  value: '6',
}, {
  text: '其它',
  value: '7',
}];

export const GOODSTYPES = [{
  value: 0,
  text: '普通货',
}, {
  value: 1,
  text: '冷冻品',
}, {
  value: 2,
  text: '危化品',
}];

export const EXPEDITED_TYPES = [{
  value: '0',
  text: '不紧急',
}, {
  value: '1',
  text: '紧急',
}, {
  value: '2',
  text: '非常紧急',
}];

export const CRM_BILLING_STATUS = {
  1: '创建未发送',
  2: '已发送,待对方对账',
  3: '待对账',
  4: '已修改,待对方对账',
  5: '接受',
  6: '已开票',
  7: '已核销',
};
