export const RELATION_TYPES = [
  { key: 'trade', value: '收发货人' },
  { key: 'owner_consumer', value: '消费使用单位' },
  { key: 'owner_producer', value: '生产销售单位' },
  { key: 'agent', value: '申报单位' },
];

export const I_E_TYPES = [
  { key: 'I', value: '进口' },
  { key: 'E', value: '出口' },
];

export const DECL_TYPE = [
  { key: 'IMPT', value: '进口报关' },
  { key: 'IBND', value: '进境备案' },
  { key: 'IMTR', value: '进口转关提前报关' },
  { key: 'IBTR', value: '进境转关提前备案' },
  { key: 'EXPT', value: '出口报关' },
  { key: 'EBND', value: '出境备案' },
  { key: 'EXTR', value: '出口转关提前报关' },
  { key: 'EBTR', value: '出境转关提前备案' },
];

export const DECL_I_TYPE = [
  { key: 'IMPT', value: '进口报关' },
  { key: 'IBND', value: '进境备案' },
  { key: 'IMTR', value: '进口转关提前报关' },
  { key: 'IBTR', value: '进境转关提前备案' },
];

export const DECL_E_TYPE = [
  { key: 'EXPT', value: '出口报关' },
  { key: 'EBND', value: '出境备案' },
  { key: 'EXTR', value: '出口转关提前报关' },
  { key: 'EBTR', value: '出境转关提前备案' },
];

export const CMS_DECL_WAY_TYPE = {
  IMPT: 'IMPT',
  IBND: 'IBND',
  IMTR: 'IMTR',
  IBTR: 'IBTR',
  EXPT: 'EXPT',
  EBND: 'EBND',
  EXTR: 'EXTR',
  EBTR: 'EBTR',
};

export const SOURCE_CHOOSE = {
  item: { key: '0', value: '企业物料表' },
  import: { key: '1', value: '导入数据' },
};

export const CMS_CIQ_STATUS = [
  { value: 0, text: '待接单' },
  { value: 1, text: '待报检' },
  { value: 4, text: '已完成' },
];

export const CIQ_SUP_STATUS = [
  { value: 0, text: '待供应商接单' },
  { value: 1, text: '待供应商报检' },
  { value: 4, text: '已完成' },
];

export const FEE_STYLE = [
  { value: 'service', text: '服务费' },
  { value: 'advance', text: '代垫费' },
];
export const FEE_CATEGORY = [
  { value: 'transport_expenses', text: '运输' },
  { value: 'customs_expenses', text: '报关' },
  { value: 'ciq_expenses', text: '报检' },
  { value: 'certs_expenses', text: '鉴定办证' },
];
export const CHARGE_PARAM = [
  { value: '$formula', text: '自定义公式' },
  { value: 'shipmt_qty', text: '运单数量' },
  { value: 'decl_qty', text: '报关单数量' },
  { value: 'decl_sheet_qty', text: '报关单联数' },
  { value: 'decl_item_qty', text: '品名数量' },
  { value: 'trade_item_qty', text: '料件数量' },
  { value: 'trade_amt', text: '货值' },
  { value: 'jdz_qty', text: '机电证数量' },
  { value: 'zgz_qty', text: '重工证数量' },
  { value: 'xkz_qty', text: '许可证数量' },
  { value: 'm3csq_qty', text: '免3C申请数量' },
  { value: 'mnxsq_qty', text: '免能效申请数量' },
  { value: 'xc_qty', text: '消磁数量' },
];

export const CERTS = [
  { value: 'jdz', text: '机电证' },
  { value: 'zgz', text: '重工证' },
  { value: 'xkz', text: '许可证' },
  { value: '3cmlwjd', text: '3C目录外鉴定' },
  { value: 'm3csq', text: '免3C申请' },
  { value: 'nxjd', text: '能效鉴定' },
  { value: 'mnxsq', text: '免能效申请' },
  { value: 'xc', text: '消磁' },
];

export const INSPECT_STATUS = {
  uninspect: 0,
  inspecting: 1,
  finish: 2,
};

export const TRANS_MODE = [
  { value: '2', text: '水路运输', icon: 'boat', desc: '' },
  { value: '5', text: '航空运输', icon: 'airplane', desc: '' },
  { value: '3', text: '铁路运输', icon: 'subway', desc: '' },
  { value: '4', text: '公路运输', icon: 'truck', desc: '' },
  { value: '9', text: '其他运输', icon: 'border-outer', desc: '其他境内流转货物，包括特殊监管区域内货物之间的流转、调拨货物，特殊监管区域、保税监管场所之间相互流转货物，特殊监管区域外的加工贸易余料结转、深加工结转、内销等货物' },
  { value: '0', text: '非保税区', icon: 'border-outer', desc: '境内非保税区运入保税区货物和保税区退区货物' },
  { value: '1', text: '监管仓库', icon: 'border-outer', desc: '境内存入出口监管仓库和出口监管仓库退仓货物' },
  { value: '7', text: '保税区', icon: 'border-outer', desc: '保税区运往境内非保税区货物' },
  { value: '8', text: '保税仓库', icon: 'border-outer', desc: '保税仓库转内销货物' },
  { value: 'W', text: '物流中心', icon: 'border-outer', desc: '从境内保税物流中心外运入中心或从中心运往境内中心外的货物' },
  { value: 'X', text: '物流园区', icon: 'border-outer', desc: '从境内保税物流园区外运入园区或从园区内运往境内园区外的货物' },
  { value: 'Y', text: '保税港区/综合保税区', icon: 'border-outer', desc: '保税港区、综合保税区与境内（区外）（非特殊区域、保税监管场所）之间进出的货物' },
  { value: 'Z', text: '出口加工区', icon: 'border-outer', desc: '出口加工区与境内（区外）（非特殊区域、保税监管场所）之间进出的货物' },
  { value: 'H', text: '边境特殊', icon: 'border-outer', desc: '境内运入深港西部通道港方口岸区的货物' },
];
export const INVOICE_TYPE = [
  { value: 0, text: '增值税专用发票' },
  { value: 1, text: '增值税普通发票' },
];

export const CMS_DELEGATION_STATUS = {
  unaccepted: 0,
  accepted: 1,
  processing: 2,
  declaring: 3,
  released: 4,
  completed: 5,
};

export const CMS_DELEGATION_MANIFEST = {
  uncreated: 0,   // 未制单
  created: 1,     // 制单中
  manifested: 2,  // 已生成报关建议书（制单完成）
};

export const CMS_BILLING_STATUS = {
  1: '创建未发送',
  2: '已发送,待对方对账',
  3: '待对账',
  4: '已修改,待对方对账',
  5: '接受',
  6: '已开票',
  7: '已核销',
};

export const MESSAGE_STATUS = {
  notRead: {
    key: 0,
    value: '未读',
  },
  read: {
    key: 1,
    value: '已读',
  },
  delete3: {
    key: 3,
    value: '已删除',
  },
};

export const CLAIM_DO_AWB = {
  notClaimDO: {
    key: 0,
    value: '无需换单',
  },
  claimDO: {
    key: 1,
    value: '需要换单',
  },
  notClaimAWB: {
    key: 0,
    value: '无需抽单',
  },
  claimAWB: {
    key: 1,
    value: '需要抽单',
  },
};

export const CMS_DUTY_TAXTYPE = [
  { value: 0, text: '供应商增票' },
  { value: 1, text: '供应商普票' },
  { value: 2, text: '我方增票' },
  { value: 3, text: '我方普票' },
  { value: 4, text: '客户增票' },
];

export const clearingOption = {
  clearSup: {
    key: 1,
    value: '与最终供应商结算',
  },
  clearAppoint: {
    key: 2,
    value: '与指定者结算',
  },
};

export const CMS_QUOTE_PERMISSION = {
  viewable: 1,
  editable: 2,
};

export const CMS_FEE_UNIT = [
  { value: '0', text: '[空]' },
  { value: '1', text: '率(%)' },
  { value: '2', text: '单价' },
  { value: '3', text: '总价' },
];

export const CMS_CONFIRM = [
  { value: '0', text: '否' },
  { value: '1', text: '是' },
];

export const CMS_DECL_DOCU = [
  { value: '00000001', text: '发票' },
  { value: '00000002', text: '装箱单' },
  { value: '00000003', text: '提运单' },
  { value: '00000004', text: '合同' },
  { value: '00000005', text: '其他1' },
  { value: '00000006', text: '其他2' },
  { value: '00000007', text: '其他3' },
  { value: '00000008', text: '代理报关委托协议' },
  { value: '10000001', text: '电子代理委托协议' },
  { value: '10000002', text: '减免税货物税款担保证明' },
  { value: '10000003', text: '减免税货物税款担保延期证明' },
];

export const CMS_CNTNR_SPEC_CUS = [
  { value: 'L', text: '2 * 标准箱' },
  { value: 'S', text: '1 * 标准箱' },
];

export const CMS_CNTNR_SPEC_CIQ = [
  { value: '111', text: '海运40尺普通' },
  { value: '112', text: '海运45尺普通' },
  { value: '121', text: '海运40尺冷藏' },
  { value: '122', text: '海运45尺冷藏' },
  { value: '131', text: '海运40尺罐式' },
  { value: '132', text: '海运45尺罐式' },
  { value: '211', text: '海运20尺普通' },
  { value: '212', text: '海运25尺普通' },
  { value: '221', text: '海运20尺冷藏' },
  { value: '222', text: '海运25尺冷藏' },
  { value: '231', text: '海运20尺罐式' },
  { value: '132', text: '海运25尺罐式' },
  { value: '201', text: '空运IKE(1.5*1.5*1.6)' },
  { value: '202', text: '空运DPE(1.15*1.5*1.6)' },
  { value: '202', text: '空运BJF(3.3*1.5*1.6)' },
  { value: '311', text: '列车40尺普通' },
  { value: '312', text: '列车40尺冷藏' },
  { value: '321', text: '列车20尺普通' },
  { value: '322', text: '列车20尺冷藏' },
  { value: '331', text: '列车10尺' },
  { value: '999', text: '其他集装箱' },
];

export const CMS_GUNIT = [
  { key: 'g_unit_1', value: '申报单位一' },
  { key: 'g_unit_2', value: '申报单位二' },
  { key: 'g_unit_3', value: '申报单位三' },
];

export const DELG_EXEMPTIONWAY = [{
  value: '1',
  text: '照章征税',
}, {
  value: '2',
  text: '折半征税',
}, {
  value: '3',
  text: '全免',
}, {
  value: '4',
  text: '特案',
}, {
  value: '5',
  text: '随征免性质',
}, {
  value: '6',
  text: '保证金',
}, {
  value: '7',
  text: '保函',
}, {
  value: '8',
  text: '折半补税',
}, {
  value: '9',
  text: '全额退税',
}];

export const DELG_SOURCE = {
  consigned: 1,       // 委托
  subcontracted: 2,   // 分包
};

export const DELG_STATUS = {
  undelg: 0,
  unaccepted: 1,
  undeclared: 2,
  declared: 3,
  finished: 4,
};

export const CMS_DECL_STATUS = {
  proposed: { value: 0, text: '建议书', badge: 'default', step: 0, stepDesc: '制单', date: 'created_date' },
  reviewed: { value: 1, text: '已复核', badge: 'processing', step: 1, stepDesc: '复核', date: 'reviewed_date' },
  sent: { value: 2, text: '已发送', badge: 'processing', step: 2, stepDesc: '发送', date: 'epsend_date' },
  entered: { value: 3, text: '回执', badge: 'processing', step: 3, stepDesc: '回执', date: 'backfill_date' },
  released: { value: 4, text: '放行', badge: 'success', step: 4, stepDesc: '放行', date: 'clear_date' },
  closed: { value: 5, text: '结关', badge: 'success', step: 5, stepDesc: '结关', date: 'close_date' },
};

export const CMS_DECL_CHANNEL = {
  QP: { value: 'qp', text: 'QP预录入', disabled: false },
  EP: { value: 'ep', text: '亿通EDI', disabled: false },
  SW: { value: 'sw', text: '单一窗口', disabled: true },
};

export const ITEMS_STATUS = [
  { value: 0, text: '未归类' },
  { value: 1, text: '归类待定' },
  { value: 2, text: '已归类' },
];

export const CMS_DECL_TYPE = [{
  value: '1',
  text: '有纸进口报关单',
}, {
  value: '3',
  text: '有纸进境备案清单',
}, {
  value: '5',
  text: '无纸进口报关单',
}, {
  value: '7',
  text: '无纸进境备案清单',
}, {
  value: '9',
  text: '通关无纸进口报关单',
}, {
  value: 'B',
  text: '通关无纸进境备案清单',
}, {
  value: '0',
  text: '有纸出口报关单',
}, {
  value: '2',
  text: '有纸出境备案清单',
}, {
  value: '4',
  text: '无纸出口报关单',
}, {
  value: '6',
  text: '无纸出境备案清单',
}, {
  value: '8',
  text: '通关无纸出口报关单',
}, {
  value: 'A',
  text: '通关无纸出境备案清单',
}];

export const CMS_IMPORT_DECL_TYPE = [{
  value: '1',
  text: '有纸进口报关单',
}, {
  value: '3',
  text: '有纸进境备案清单',
}, {
  value: '5',
  text: '无纸进口报关单',
}, {
  value: '7',
  text: '无纸进境备案清单',
}, {
  value: '9',
  text: '通关无纸进口报关单',
}, {
  value: 'B',
  text: '通关无纸进境备案清单',
}];

export const CMS_EXPORT_DECL_TYPE = [{
  value: '0',
  text: '有纸出口报关单',
}, {
  value: '2',
  text: '有纸出境备案清单',
}, {
  value: '4',
  text: '无纸出口报关单',
}, {
  value: '6',
  text: '无纸出境备案清单',
}, {
  value: '8',
  text: '通关无纸出口报关单',
}, {
  value: 'A',
  text: '通关无纸出境备案清单',
}];

export const TRADE_ITEM_STATUS = {
  unclassified: 0,
  pending: 1,
  classified: 2,
};

export const CMS_TRADE_REPO_PERMISSION = {
  edit: 'edit',
  // approval: 'approval',
  view: 'view',
};

export const CMS_BILL_TEMPLATE_PERMISSION = {
  edit: 'edit',
  view: 'view',
};

export const CMS_SPLIT_COUNT = [
  { value: '20', text: '按20品拆分' },
  { value: '50', text: '按50品拆分' },
];

export const CMS_DOCU_TYPE = {
  invoice: 0,
  contract: 1,
  packingList: 2,
};

export const SPECIAL_COPNO_TERM = [
  { value: 'A', text: '特殊货号' },
];

export const CIQ_IN_DECL_TYPE = [
  { value: 13, text: '入境检验检疫' },
  { value: 14, text: '入境流向' },
  { value: 15, text: '入境验证' },
];

export const CIQ_OUT_DECL_TYPE = [
  { value: 21, text: '出境预检' },
  { value: 24, text: '出境检验检疫' },
  { value: 25, text: '出境核查货证' },
  { value: 28, text: '出境验证' },
];

export const CIQ_SPECIAL_DECL_FLAG = [
  { value: 1, text: '国际赛事' },
  { value: 2, text: '特殊进出军工物资' },
  { value: 3, text: '国际援助物资' },
  { value: 4, text: '国际会议' },
];

export const CIQ_SPECIAL_PASS_FLAG = [
  { value: 1, text: '直通放行' },
  { value: 2, text: '外交礼遇' },
  { value: 3, text: '转关' },
];
