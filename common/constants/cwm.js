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
  ftztext: '一二线先报后入',
  tagcolor: 'blue',
}, {
  value: '2',
  text: '先入库后报关',
  ftztext: '视同出口',
  tagcolor: 'green',
}, {
  value: '3',
  text: '不报关',
  ftztext: '区内转入',
  tagcolor: 'yellow',
}];

exports.CWM_ASN_STATUS = {
  PENDING: {
    value: 0,
    text: '通知接收',
    badge: 'default',
  },
  INBOUND: {
    value: 1,
    text: '已释放',
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
    text: '已释放',
    badge: 'processing',
  },
  PARTIAL: {
    value: 2,
    text: '部分发货',
    badge: 'warning',
  },
  COMPLETED: {
    value: 3,
    text: '发货完成',
    badge: 'success',
  },
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
  value: 'normal',
  text: '先报关后出库',
  ftztext: '普通出库',
  tagcolor: 'blue',
}, {
  value: 'portion',
  text: '先出库后报关',
  ftztext: '分拨出库',
  tagcolor: 'green',
}, {
  value: 'transfer',
  text: '不报关',
  ftztext: '区内转出',
  tagcolor: 'yellow',
}];

exports.CWM_BATCH_APPLYTYPES = [{
  value: 0,
  text: '普通报关申请单',
}, {
  value: 1,
  text: '跨关区报关申请单',
}, {
  value: 2,
  text: '保展报关申请单',
}];

exports.CWM_DOCU_TYPE = {
  receiveTaskList: 0, // 入库任务清单
  putawayTaskList: 1, // 上架任务清单
  pickingTaskList: 2, // 拣货任务清单
  packingList: 3,     // 装箱单
  loadingList: 4,     // 装车单
};

exports.CWM_RULES = {
  PUTAWAY_RULE: {
    key: 'putway',
    text: '上架规则',
  },
  ALLOC_RULE: {
    key: 'alloc',
    text: '分配规则',
  },
  REPLENISH_RULE: {
    key: 'replenish',
    text: '补货规则',
  },
  WAVE_RULE: {
    key: 'wave',
    text: '波次计划规则',
  },
  SEQUENCE_RULE: {
    key: 'sequence',
    text: '流水号规则',
  },
};

exports.CWM_OUTBOUND_STATUS = {
  CREATED: {
    value: 0,
    step: 0,
  },
  PARTIAL_ALLOC: {
    value: 1,
    step: 1,
  },
  ALL_ALLOC: {
    value: 2,
    step: 1,
  },
  PARTIAL_PICKED: {
    value: 3,
    step: 2,
  },
  ALL_PICKED: {
    value: 4,
    step: 2,
  },
  PACKED: {
    value: 5,
    step: 3,
  },
  SHIPPING: {
    value: 6,
    step: 4,
  },
  COMPLETED: {
    value: 7,
    step: 5,
  },
};

exports.CWM_LOCATION_TYPES = [{
  value: 1,
  text: '货架',
}, {
  value: 2,
  text: '窄巷道货架',
}, {
  value: 3,
  text: '重力式货架',
}, {
  value: 4,
  text: '地面平仓',
}];

exports.CWM_LOCATION_STATUS = [{
  value: 1,
  text: '正常',
}, {
  value: 0,
  text: '封存',
}, {
  value: -1,
  text: '禁用',
}];

exports.CWM_MOVEMENT_STATUS = {
  CREATED: {
    value: 0,
    step: 0,
  },
  COMPLETED: {
    value: 1,
    step: 1,
  },
};

exports.CWM_MOVE_TYPE = [{
  value: 1,
  text: '普通移库',
}];
