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
  CREATE: 0,
  RECEIVE: 1,
  PUTAWAY: 3,
  COMPLETED: 5,
};

exports.CWM_SHFTZ_APIREG_STATUS = {
  pending: 0,
  sent: 1,
  completed: 2,
};
