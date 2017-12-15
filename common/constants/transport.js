export const TRANSPORT_EXCEPTIONS = [{
  key: 'SHIPMENT_EXCEPTION_SYS_PICKUP_OVERDUE',
  code: 11012,
  level: 'WARN',
  name: '提货超时',
}, {
  key: 'SHIPMENT_EXCEPTION_VEHICLE_ACCIDENT',
  code: 12004,
  level: 'WARN',
  name: '在途异常',
}, {
  key: 'SHIPMENT_EXCEPTION_SYS_DELIVER_OVERDUE',
  code: 11013,
  level: 'WARN',
  name: '送货超时',
}, {
  key: 'SHIPMENT_EXCEPTION_GOODS_SHORTAGE',
  code: 12008,
  level: 'ERROR',
  name: '货差',
}, {
  key: 'SHIPMENT_EXCEPTION_DELIVER_REJECTED',
  code: 12009,
  level: 'ERROR',
  name: '货物拒收',
}, {
  key: 'SHIPMENT_EXCEPTION_SPECIAL_COST',
  code: 12012,
  level: 'ERROR',
  name: '索赔',
}, {
  key: 'SHIPMENT_EXCEPTION_COMPLAINT',
  code: 12013,
  level: 'WARN',
  name: '投诉',
}];

export const SHIPMENT_EFFECTIVES = {
  cancelled: -1,
  draft: 0,
  effected: 1,
  archived: 2,
};

export const SHIPMENT_SOURCE = {
  consigned: 1, // 委托
  subcontracted: 2, // 分包
};

export const SHIPMENT_TRACK_STATUS = {
  unaccepted: 1,
  accepted: 2,
  dispatched: 3,
  intransit: 4,
  delivered: 5,
  podsubmit: 6,
  podaccept: 7,
};

export const TMS_SHIPMENT_STATUS_DESC = [
  {
    status: 2, text: '接单', badge: 'default', date: 'acpt_time',
  },
  {
    status: 3, text: '调度', badge: 'warning', date: 'disp_time',
  },
  {
    status: 4, text: '提货', badge: 'processing', date: 'pickup_act_date',
  },
  {
    status: 5, text: '送货', badge: 'success', date: 'deliver_act_date',
  },
  {
    status: 6, text: '回单上传', badge: 'success', date: 'pod_recv_date',
  },
  {
    status: 7, text: '回单接受', badge: 'success', date: 'pod_acpt_date',
  },
];

export const SHIPMENT_VEHICLE_CONNECT = {
  disconnected: 0,
  app: 1,
  g7: 2,
};

export const TRACKING_POINT_FROM_TYPE = {
  manual: 0,
  app: 1,
  gps: 2,
};

export const SHIPMENT_POD_STATUS = {
  unsubmit: 0,
  pending: 1,
  rejectByUs: -1,
  acceptByUs: 2,
  rejectByClient: -2,
  acceptByClient: 3,
};

export const VEHICLE_STATUS = {
  disabled: { value: -1, text: '停用' },
  notUse: { value: 0, text: '不在途' },
  inUse: { value: 1, text: '在途' },
};

export const DRIVER_STATUS = {
  notUse: { value: 0, text: '不可用' },
  inUse: { value: 1, text: '可用' },
};

export const GOODS_TYPES = [{
  value: 0,
  text: '普通货物',
}, {
  value: 1,
  text: '温控货物',
}, {
  value: 2,
  text: '危化品',
}, {
  value: 3,
  text: '大件货物',
}];

export const CONTAINER_PACKAGE_TYPE = [{
  id: 0,
  key: 'GP20',
  value: 'GP20',
}, {
  id: 1,
  key: 'GP40',
  value: 'GP40',
}, {
  id: 2,
  key: 'HQ40',
  value: 'HQ40',
}];

export const PRESET_TRANSMODES = {
  ftl: 'FTL', // 整车
  exp: 'EXP', // 快递
  ltl: 'LTL', // 零担
  ctn: 'CTN', // 集装箱
};

export const TRANS_MODE_INDICATOR = [
  {
    value: 'EXP', text: '快递快运', icon: 'courier-o', desc: '',
  },
  {
    value: 'LTL', text: '公路零担', icon: 'packing-o', desc: '',
  },
  {
    value: 'FTL', text: '公路整车', icon: 'truck-o', desc: '',
  },
  {
    value: 'CTN', text: '集卡拖车', icon: 'sku-o', desc: '',
  },
  {
    value: 'AIR', text: '空运', icon: 'departure', desc: '',
  },
];

export const SHIPMENT_BILLING_STATUS = {
  1: '创建未发送',
  2: '已发送,待对方对账',
  3: '待对账',
  4: '已修改,待对方对账',
  5: '接受',
  6: '已核销',
};

export const TMS_DUTY_TAXTYPE = [
  { value: 0, text: '供应商增票' },
  { value: 1, text: '供应商普票' },
  { value: 2, text: '我方增票' },
  { value: 3, text: '我方普票' },
  { value: 4, text: '客户增票' },
];

export const TARIFF_PARTNER_PERMISSION = {
  viewable: 1,
  editable: 2,
};
export const SHIPMENT_LOG_CATEGORY = {
  operation: 'operation',
  message: 'message',
  tracking: 'tracking',
  exception: 'exception',
  fee: 'fee',
};
export const COURIERS = [
  { name: '顺丰速运', code: 'sfexpress' },
  { name: '圆通', code: 'yto' },
  { name: '申通', code: 'sto' },
  { name: '中通', code: 'zto' },
  { name: '韵达', code: 'yunda' },
  { name: '百世快递', code: 'bestexpress' },
  { name: '天天快递', code: 'ttkdex' },
  { name: 'EMS', code: 'ems' },
  { name: '宅急送', code: 'zjs' },
  { name: '德邦物流', code: 'deppon' },
];
