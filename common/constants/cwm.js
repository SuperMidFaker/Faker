exports.CWM_SKU_PACK_UNITS = [{
  value: '00',
  text: '单件(散装)',
}, {
  value: '01',
  text: '包',
}, {
  value: '02',
  text: '木箱',
}, {
  value: '03',
  text: '纸箱',
}, {
  value: '04',
  text: '托盘',
}];

exports.CWM_ASN_TYPES = [{
  value: '1',
  text: '采购入库',
}, {
  value: '2',
  text: '调拨入库',
}, {
  value: '3',
  text: '退货入库',
}];

exports.CWM_ASN_BONDED_REGTYPES = [{
  value: '1',
  text: '先报关后入库',
}, {
  value: '2',
  text: '先入库后报关',
}, {
  value: '3',
  text: '不报关',
}];

exports.CWM_ASN_STATUS = {
  PENDING: {
    value: 0,
    text: '通知接收',
    badge: 'default',
  },
  INBOUND: {
    value: 1,
    text: '入库操作',
    badge: 'processing',
  },
  PARTIAL: {
    value: 2,
    text: '部分收货',
    badge: 'warning',
  },

  COMPLETED: {
    value: 3,
    text: '收货完成',
    badge: 'success',
  },
};

exports.CWM_INBOUND_STATUS = {
  CREATED: {
    value: 0,
    step: 0,
  },
  PARTIAL_RECEIVED: {
    value: 1,
    step: 1,
  },
  ALL_RECEIVED: {
    value: 2,
    step: 1,
  },
  PARTIAL_PUTAWAY: {
    value: 3,
    step: 2,
  },
  ALL_PUTAWAY: {
    value: 4,
    step: 2,
  },
  COMPLETED: {
    value: 5,
    step: 3,
  },
};

exports.CWM_SHFTZ_APIREG_STATUS = {
  pending: 0,
  sent: 1,
  completed: 2,
};

exports.CWM_SO_STATUS = {
  PENDING: {
    value: 0,
    text: '订单接收',
    badge: 'default',
  },
  OUTBOUND: {
    value: 1,
    text: '出库操作',
    badge: 'processing',
  },
  COMPLETED: {
    value: 3,
    text: '发货完成',
    badge: 'success',
  },
};

exports.CWM_OUTBOUND_STATUS = {
  CREATED: 0,
  PARTIAL_ALLOCATED: 1,
  ALL_ALLOCATED: 2,
  PARTIAL_PICKED: 3,
  ALL_PICKED: 4,
  PARTIAL_SHIPPED: 5,
  ALL_SHIPPED: 6,
};

exports.CWM_OUTBOUND_ALLOC_STATUS = {
  CREATED: 0,
  ALLOCATED: 2,
  PICKED: 4,
  SHIPPED: 6,
};

exports.CWM_OUTBOUND_PACK_STATUS = {
  NOT_APPLICATED: -1,
  PENDING: 0,
  PARTIAL_PACKED: 1,
  ALL_PACKED: 2,
};

exports.CWM_SO_TYPES = [{
  value: '1',
  text: '销售出库',
}, {
  value: '2',
  text: '调拨出库',
}];

exports.CWM_SO_BONDED_REGTYPES = [{
  value: '1',
  text: '先报关后出库',
}, {
  value: '2',
  text: '先出库后报关',
}, {
  value: '3',
  text: '不报关',
}];
