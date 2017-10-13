exports.CWM_SKU_PACKS = [{
  value: '00',
  text: '单件(散装)',
}, {
  value: '01',
  text: '内包装(包/盒/袋等)',
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
}, {
  value: '4',
  text: '越库入库',
}];

exports.CWM_ASN_BONDED_REGTYPES = [{
  value: 'entry',
  text: '先报关后入库',
  ftztext: '进境入库',
  tagcolor: 'blue',
}, {
  value: 'export',
  text: '先入库后报关',
  ftztext: '视同出口',
  tagcolor: 'green',
}, {
  value: 'transfer',
  text: '不报关',
  ftztext: '区内转入',
  tagcolor: 'cyan',
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
  DISCREPANT: {
    value: 2,
    text: '收货差异',
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
  processing: 1,
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
    text: '部分出库',
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
}, {
  value: '3',
  text: '越库出库',
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
  tagcolor: 'cyan',
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
  value: '1',
  text: '货架',
}, {
  value: '2',
  text: '窄巷道货架',
}, {
  value: '3',
  text: '重力式货架',
}, {
  value: '4',
  text: '地面平仓',
}];

exports.CWM_LOCATION_STATUS = [{
  value: '5',
  text: '优先出库',
}, {
  value: '1',
  text: '正常',
}, {
  value: '0',
  text: '封存',
}, {
  value: '-1',
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

exports.CWM_MOVEMENT_TYPE = [{
  value: 1,
  text: '库内移位',
}, {
  value: 2,
  text: '跨仓移库',
}];

exports.CWM_STOCK_SEARCH_TYPE = [{
  value: 1,
  text: '按货主汇总',
}, {
  value: 2,
  text: '按货品汇总',
}, {
  value: 3,
  text: '按库位汇总',
}, {
  value: 4,
  text: '按货品/库位汇总',
}];

exports.CWM_DAMAGE_LEVEL = [{
  value: 0,
  text: '包装完好',
  color: '#87d068',
}, {
  value: 1,
  text: '轻微擦痕',
  color: 'green',
}, {
  value: 2,
  text: '中度磨损',
  color: 'orange',
}, {
  value: 3,
  text: '重度磨损',
  color: 'red',
}, {
  value: 4,
  text: '严重破损',
  color: '#f50',
}];

exports.CWM_TRANSACTIONS_TYPE = {
  inbound: { text: '入库' },
  outbound: { text: '出库' },
  transout: { text: '转移出' },
  transin: { text: '转移入' },
  moveout: { text: '移动出' },
  movein: { text: '移动入' },
  adjustout: { text: '调整出' },
  adjustin: { text: '调整入' },
  freezeout: { text: '可用出' },
  freezein: { text: '冻结入' },
  unfreezeout: { text: '可用入' },
  unfreezein: { text: '冻结出' },
};

exports.CWM_SHFTZ_REG_STATUS_INDICATOR = [{
  value: 0,
  text: '待备案',
  tagcolor: 'blue',
  badge: 'warning',
}, {
  value: 1,
  text: '已发送',
  tagcolor: 'green',
  badge: 'processing',
}, {
  value: 2,
  text: '备案完成',
  tagcolor: 'cyan',
  badge: 'success',
}];

exports.CWM_SHFTZ_TRANSFER_IN_STATUS_INDICATOR = [{
  value: 0,
  text: '待转入',
  tagcolor: 'blue',
  badge: 'warning',
}, {
  value: 1,
  text: '已接收',
  tagcolor: 'green',
  badge: 'processing',
}, {
  value: 2,
  text: '已核对',
  tagcolor: 'cyan',
  badge: 'success',
}];

exports.CWM_SHFTZ_TRANSFER_OUT_STATUS_INDICATOR = [{
  value: 0,
  text: '待转出',
  tagcolor: 'blue',
  badge: 'warning',
}, {
  value: 1,
  text: '已发送',
  tagcolor: 'green',
  badge: 'processing',
}, {
  value: 2,
  text: '已转出',
  tagcolor: 'cyan',
  badge: 'success',
}];

exports.CWM_INBOUND_STATUS_INDICATOR = [{
  value: 0,
  text: '待入库',
  tagcolor: 'blue',
  badge: 'warning',
}, {
  value: 1,
  text: '收货',
  tagcolor: 'green',
  badge: 'processing',
}, {
  value: 2,
  text: '收货',
  tagcolor: 'cyan',
  badge: 'processing',
}, {
  value: 3,
  text: '上架',
  tagcolor: 'cyan',
  badge: 'processing',
}, {
  value: 4,
  text: '上架',
  tagcolor: 'cyan',
  badge: 'processing',
}, {
  value: 5,
  text: '已入库',
  tagcolor: 'cyan',
  badge: 'success',
}];

exports.CWM_OUTBOUND_STATUS_INDICATOR = [{
  value: 0,
  text: '待出库',
  tagcolor: 'blue',
  badge: 'warning',
}, {
  value: 1,
  text: '部分分配',
  tagcolor: 'green',
  badge: 'processing',
}, {
  value: 2,
  text: '全部分配',
  tagcolor: 'cyan',
  badge: 'processing',
}, {
  value: 3,
  text: '部分拣货',
  tagcolor: 'cyan',
  badge: 'processing',
}, {
  value: 4,
  text: '全部拣货',
  tagcolor: 'cyan',
  badge: 'processing',
}, {
  value: 5,
  text: '复核装箱',
  tagcolor: 'cyan',
  badge: 'processing',
}, {
  value: 6,
  text: '部分发货',
  tagcolor: 'cyan',
  badge: 'processing',
}, {
  value: 7,
  text: '已出库',
  tagcolor: 'cyan',
  badge: 'success',
}];

exports.DELIVER_TYPES = [{
  name: '客户自提', value: 1,
}, {
  name: '仓库配送', value: 2,
}, {
  name: '第三方配送', value: 3,
}];

exports.WHSE_OPERATION_MODES = {
  scan: { value: 'scan', text: '扫描' },
  manual: { value: 'manual', text: '手动' },
};
