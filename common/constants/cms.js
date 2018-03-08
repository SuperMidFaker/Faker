export const CMS_PLUGINS = [
  { key: 'ciqdecl', name: '报检申报' },
  { key: 'tradeitem', name: '商品归类', desc: '企业级归类数据库' },
  { key: 'permit', name: '许可证件' },
  { key: 'manual', name: '电子账册' },
  { key: 'receivable', name: '费用应收' },
  { key: 'payable', name: '费用应付' },
  { key: 'analytics', name: '统计分析' },
];

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

export const FEE_TYPE = [
  { value: 'SC', text: '服务费' },
  { value: 'AP', text: '代垫费' },
];
export const FEE_GROUP = [
  { value: 'TR', text: '运输' },
  { value: 'CCL', text: '清关' },
];
export const FEE_CATEGORY = [
  { value: 'transport_expenses', text: '运输' },
  { value: 'customs_expenses', text: '报关' },
  { value: 'ciq_expenses', text: '报检' },
  { value: 'certs_expenses', text: '鉴定办证' },
];
export const FORMULA_PARAMS = [
  { value: 'shipmt_qty', text: '货运数量' },
  { value: 'decl_qty', text: '报关单数量' },
  { value: 'decl_sheet_qty', text: '联单数量' },
  { value: 'decl_item_qty', text: '品项数量' },
  { value: 'trade_item_qty', text: '料件数量' },
  { value: 'trade_amt', text: '进出口金额' },
];
export const BILLING_METHOD = [
  {
    label: '自动计费',
    key: '$formula',
    value: '$formula',
    children: [
      { key: 'shipmt_qty', value: 'shipmt_qty', label: '按货运数量' },
      { key: 'decl_qty', value: 'decl_qty', label: '按报关单数量' },
      { key: 'decl_sheet_qty', value: 'decl_sheet_qty', label: '按联单数量' },
      { key: 'decl_item_qty', value: 'decl_item_qty', label: '按品名数量' },
      { key: 'trade_item_qty', value: 'trade_item_qty', label: '按料件数量' },
    ],
  },
  { key: '$manual', value: '$manual', label: '手动计费' },
  { key: '$included', value: '$included', label: '包干不计费' },
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
  {
    value: '2', text: '水路运输', icon: 'boat', desc: '',
  },
  {
    value: '5', text: '航空运输', icon: 'airplane', desc: '',
  },
  {
    value: '3', text: '铁路运输', icon: 'subway', desc: '',
  },
  {
    value: '4', text: '公路运输', icon: 'truck', desc: '',
  },
  {
    value: '9', text: '其他运输', icon: 'border-outer', desc: '其他境内流转货物，包括特殊监管区域内货物之间的流转、调拨货物，特殊监管区域、保税监管场所之间相互流转货物，特殊监管区域外的加工贸易余料结转、深加工结转、内销等货物',
  },
  {
    value: '0', text: '非保税区', icon: 'border-outer', desc: '境内非保税区运入保税区货物和保税区退区货物',
  },
  {
    value: '1', text: '监管仓库', icon: 'border-outer', desc: '境内存入出口监管仓库和出口监管仓库退仓货物',
  },
  {
    value: '7', text: '保税区', icon: 'border-outer', desc: '保税区运往境内非保税区货物',
  },
  {
    value: '8', text: '保税仓库', icon: 'border-outer', desc: '保税仓库转内销货物',
  },
  {
    value: 'W', text: '物流中心', icon: 'border-outer', desc: '从境内保税物流中心外运入中心或从中心运往境内中心外的货物',
  },
  {
    value: 'X', text: '物流园区', icon: 'border-outer', desc: '从境内保税物流园区外运入园区或从园区内运往境内园区外的货物',
  },
  {
    value: 'Y', text: '保税港区/综合保税区', icon: 'border-outer', desc: '保税港区、综合保税区与境内（区外）（非特殊区域、保税监管场所）之间进出的货物',
  },
  {
    value: 'Z', text: '出口加工区', icon: 'border-outer', desc: '出口加工区与境内（区外）（非特殊区域、保税监管场所）之间进出的货物',
  },
  {
    value: 'H', text: '边境特殊', icon: 'border-outer', desc: '境内运入深港西部通道港方口岸区的货物',
  },
];
export const INVOICE_TYPE = [
  { value: 'vat', text: '增值税专用发票' },
  { value: 'general', text: '增值税普通发票' },
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
  uncreated: 0, // 未制单
  created: 1, // 制单中
  manifested: 2, // 已生成报关建议书（制单完成）
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
  { value: '1', text: '发票' },
  { value: '2', text: '装箱单' },
  { value: '3', text: '提运单' },
  { value: '4', text: '合同' },
  { value: '5', text: '其他1' },
  { value: '6', text: '其他2' },
  { value: '7', text: '其他3' },
  { value: '8', text: '代理报关委托协议' },
  { value: 'A', text: '电子代理委托协议' },
  { value: 'B', text: '减免税货物税款担保证明' },
  { value: 'C', text: '减免税货物税款担保延期证明' },
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
  consigned: 1, // 委托
  subcontracted: 2, // 分包
};

export const DELG_STATUS = {
  undelg: 0,
  unaccepted: 1,
  undeclared: 2,
  declared: 3,
  finished: 4,
};

export const CMS_DECL_STATUS = {
  proposed: {
    value: 0, text: '建议书', icon: 'file-text', badge: 'default', step: 0, stepDesc: '制单', date: 'created_date',
  },
  reviewed: {
    value: 1, text: '已复核', icon: 'check-square-o', badge: 'processing', step: 1, stepDesc: '复核', date: 'reviewed_date',
  },
  sent: {
    value: 2, text: '已发送', icon: 'export', badge: 'processing', step: 2, stepDesc: '发送', date: 'epsend_date',
  },
  entered: {
    value: 3, text: '回执', icon: 'mail', badge: 'processing', step: 3, stepDesc: '回执', date: 'backfill_date',
  },
  released: {
    value: 4, text: '放行', icon: 'flag', badge: 'success', step: 4, stepDesc: '放行', date: 'clear_date',
  },
  /*
  closed: {
    value: 5, text: '结关', icon: '', badge: 'success', step: 5, stepDesc: '结关', date: 'close_date',
  },
  */
};

export const CMS_DECL_CHANNEL = {
  QP: { value: 'qp', text: 'QP预录入', disabled: false },
  EP: { value: 'ep', text: '亿通EDI', disabled: false },
  SW: { value: 'sw', text: '单一窗口', disabled: false },
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

export const CMS_TRADE_ITEM_TYPE = [
  { value: 'RM', text: '料件' },
  { value: 'FP', text: '成品' },
];

export const SPECIAL_COPNO_TERM = [
  { value: 'A', text: '特殊货号' },
];

export const TRADE_ITEM_APPLY_CERTS = [
  {
    app_cert_code: '11', app_cert_name: '品质证书',
  },
  {
    app_cert_code: '12', app_cert_name: '重量证书',
  },
  {
    app_cert_code: '13', app_cert_name: '数量证书',
  },
  {
    app_cert_code: '14', app_cert_name: '兽医卫生证书',
  },
  {
    app_cert_code: '15', app_cert_name: '健康证书',
  },
  {
    app_cert_code: '16', app_cert_name: '卫生证书',
  },
  {
    app_cert_code: '17', app_cert_name: '动物卫生证书',
  },
  {
    app_cert_code: '18', app_cert_name: '植物检疫证书',
  },
  {
    app_cert_code: '19', app_cert_name: '熏蒸/消毒证书',
  },
  {
    app_cert_code: '20', app_cert_name: '出境货物换证凭单',
  },
  {
    app_cert_code: '21', app_cert_name: '入境货物检验检疫证明',
  },
  {
    app_cert_code: '22', app_cert_name: '出境货物不合格通知单',
  },
  {
    app_cert_code: '23', app_cert_name: '集装箱检验检疫结果单',
  },
  {
    app_cert_code: '99', app_cert_name: '其他证书',
  },
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

export const CIQ_TRANSPORTS_TYPE = [
  { value: 1, text: '水路运输' },
  { value: 2, text: '铁路运输' },
  { value: 3, text: '公路运输' },
  { value: 4, text: '航空运输' },
  { value: 5, text: '旅客携带' },
  { value: 6, text: '管道运输' },
  { value: 9, text: '其他运输' },
];

export const CIQ_TRADE_MODE = [
  { value: 11, text: '一般贸易' },
  { value: 12, text: '来料加工' },
  { value: 13, text: '进料加工' },
  { value: 14, text: '易货贸易' },
  { value: 15, text: '补偿贸易' },
  { value: 16, text: '边境贸易' },
  { value: 17, text: '无偿援助' },
  { value: 18, text: '外商投资' },
  { value: 19, text: '其他贸易性货物' },
  { value: 20, text: '样品' },
  { value: 21, text: '对外承包工程进出口货物' },
  { value: 22, text: '暂时进出口留购货物' },
  { value: 23, text: '保税区进出境仓储、转口货物' },
  { value: 24, text: '保税区进出区货物' },
  { value: 25, text: '出口加工区进出境货物' },
  { value: 26, text: '出口加工区进出区货物' },
  { value: 27, text: '退运货物' },
  { value: 28, text: '过境货物' },
  { value: 29, text: '暂时进出口货物' },
  { value: 30, text: '展览品' },
];

export const CIQ_ENT_QUALIFY_TYPE = [
  { value: 0, text: '企业产品许可类别' },
  { value: 100, text: '通关司类' },
  { value: 101, text: '检疫处理单位审批' },
  { value: 200, text: '卫生司类' },
  { value: 300, text: '动植司类' },
  { value: 303, text: '进境水果境外果园/包装厂注册登记' },
  { value: 306, text: '进口饲料和饲料添加剂生产企业注册登记' },
  { value: 307, text: '进境非食用动物产品生产、加工、存放企业注册登记' },
  { value: 312, text: '进境植物繁殖材料隔离检疫圃申请' },
  { value: 317, text: '进出境动物指定隔离检疫场使用申请' },
  { value: 319, text: '进境栽培介质使用单位注册' },
  { value: 320, text: '进境动物遗传物质进口代理及使用单位备案' },
  { value: 321, text: '进境动物及动物产品国外生产单位注册' },
  { value: 322, text: '饲料进口企业备案' },
  { value: 326, text: '进境粮食加工储存单位注册' },
  { value: 400, text: '检验司类' },
  { value: 413, text: '进口可用作原料的固体废物国内收货人注册登记' },
  { value: 414, text: '进口可用作原料的固体废物国外供货商注册登记' },
  { value: 415, text: '进出境集装箱场站登记' },
  { value: 416, text: '进口棉花境外供货商登记注册' },
];

export const CIQ_INSP_QUAE_DOCUMENTS = [
  {
    app_cert_code: '11', app_cert_name: '品质证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '12', app_cert_name: '重量证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '13', app_cert_name: '数量证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '14', app_cert_name: '兽医卫生证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '15', app_cert_name: '健康证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '16', app_cert_name: '卫生证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '17', app_cert_name: '动物卫生证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '18', app_cert_name: '植物检疫证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '19', app_cert_name: '熏蒸/消毒证书', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '20', app_cert_name: '出境货物换证凭单', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '21', app_cert_name: '入境货物检验检疫证明', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '22', app_cert_name: '出境货物不合格通知单', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '23', app_cert_name: '集装箱检验检疫结果单', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '97', app_cert_name: '通关单', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '98', app_cert_name: '其他单', appl_ori: 1, appl_copy_quan: 2,
  },
  {
    app_cert_code: '99', app_cert_name: '其他证书', appl_ori: 1, appl_copy_quan: 2,
  },
];

export const CIQ_ATT_DOCUMENTS = [
  { att_doc_type_code: '101001', att_doc_name: '合同' },
  { att_doc_type_code: '101002', att_doc_name: '发票' },
  { att_doc_type_code: '101003', att_doc_name: '信用证' },
  { att_doc_type_code: '101004', att_doc_name: '装箱单' },
  { att_doc_type_code: '101005', att_doc_name: '提单/运单' },
  { att_doc_type_code: '101006', att_doc_name: '兽医(卫生)证书' },
  { att_doc_type_code: '101007', att_doc_name: '植物检疫证书' },
  { att_doc_type_code: '101008', att_doc_name: '动物检疫证书' },
  { att_doc_type_code: '101009', att_doc_name: '卫生证书' },
  { att_doc_type_code: '101010', att_doc_name: '原产地证书' },
  { att_doc_type_code: '101011', att_doc_name: '其他相关许可/审批文件' },
  { att_doc_type_code: '101012', att_doc_name: '到货通知' },
  { att_doc_type_code: '101013', att_doc_name: '质保书' },
  { att_doc_type_code: '101014', att_doc_name: '理货清单' },
  { att_doc_type_code: '101015', att_doc_name: '磅码单' },
  { att_doc_type_code: '101016', att_doc_name: '验收报告' },
  { att_doc_type_code: '101017', att_doc_name: '限制类环保证书' },
  { att_doc_type_code: '101018', att_doc_name: '装运前检验证书' },
  { att_doc_type_code: '101019', att_doc_name: '风险报告' },
  { att_doc_type_code: '101020', att_doc_name: '海关进口证明书' },
  { att_doc_type_code: '101021', att_doc_name: '随车检验单' },
  { att_doc_type_code: '101022', att_doc_name: '进口旧机电产品装运前预检验备案书' },
  { att_doc_type_code: '101023', att_doc_name: '进口旧机电产品免装运前预检验证明书' },
  { att_doc_type_code: '101024', att_doc_name: '非针叶木包装声明' },
  { att_doc_type_code: '101025', att_doc_name: '无木质包装证明' },
  { att_doc_type_code: '101026', att_doc_name: '美日输华熏蒸证明' },
  { att_doc_type_code: '101027', att_doc_name: '进口涂料备案书' },
  { att_doc_type_code: '101028', att_doc_name: '海关免税证明' },
  { att_doc_type_code: '101029', att_doc_name: '自动类环保证书' },
  { att_doc_type_code: '101030', att_doc_name: '进境动植物检疫许可证' },
  { att_doc_type_code: '101031', att_doc_name: '农业转基因生物安全证书或相关批准文件' },
  { att_doc_type_code: '101032', att_doc_name: '农业转基因生物标识审查认可批准文件' },
  { att_doc_type_code: '101033', att_doc_name: '转基因产品过境转移许可证' },
  { att_doc_type_code: '101034', att_doc_name: '进出口电池备案书' },
  { att_doc_type_code: '101035', att_doc_name: '强制性产品认证证书' },
  { att_doc_type_code: '101036', att_doc_name: '实施金伯利进程国际证书制度注册登记证' },
  { att_doc_type_code: '101037', att_doc_name: '中华人民共和国进口毛坯钻石申报单' },
  { att_doc_type_code: '101038', att_doc_name: '入/出境特殊物品卫生检疫审批单' },
  { att_doc_type_code: '101039', att_doc_name: '报检委托书' },
  { att_doc_type_code: '101040', att_doc_name: '其他单据' },
  { att_doc_type_code: '101041', att_doc_name: '合格保证' },
];

export const CIQ_PACK_TYPE = [
  { value: '190', text: '其他桶' },
  { value: '1A1', text: '钢制不可拆装桶顶圆桶' },
  { value: '1A2', text: '钢制可拆装桶顶圆桶' },
  { value: '1A3', text: '镀锌闭口钢桶' },
  { value: '1A4', text: '镀锌开口钢桶' },
  { value: '1B1', text: '铝制不可拆装桶顶圆桶' },
  { value: '1B2', text: '铝制可拆装桶顶圆桶' },
  { value: '1C', text: '木圆桶' },
  { value: '1D', text: '胶合板圆桶' },
  { value: '1G', text: '纤维圆桶' },
  { value: '1H', text: '塑料圆桶' },
  { value: '1H1', text: '塑料不可拆装桶顶圆桶' },
  { value: '1H2', text: '塑料可拆装桶顶圆桶' },
  { value: '2C1', text: '塞式木琵琶桶' },
  { value: '2C2', text: '非水密型木琵琶桶' },
  { value: '390', text: '其他罐' },
  { value: '3A1', text: '钢制不可拆装罐顶罐' },
  { value: '3A2', text: '钢制可拆装罐顶罐' },
  { value: '3B1', text: '铝制不可拆装罐顶罐' },
  { value: '3B2', text: '铝制可拆装罐顶罐' },
];

export const CIQ_LICENCE_TYPE = [
  { value: '203', text: '出入境特殊物品卫生检疫审批' },
  { value: '325', text: '进境动植物检疫许可证' },
  { value: '401', text: '进出口商品免验' },
  { value: '402', text: '进口旧机电产品备案' },
  { value: '408', text: '汽车预审备案' },
  { value: '409', text: '免于强制性认证特殊用途进口汽车检测处理程序车辆' },
  { value: '410', text: '免于办理强制性产品认证' },
  { value: '411', text: '强制性产品（CCC）认证' },
  { value: '412', text: '进口涂料备案' },
  { value: '422', text: '进口废物原料装运前检验证书' },
  { value: '423', text: '进境旧机电境外预检验证书' },
  { value: '516', text: '进口化妆品产品备案' },
  { value: '517', text: '进口预包装食品标签备案' },
  { value: '519', text: '进口食品境外生产企业注册' },
  { value: '523', text: '进口化妆品产品套装备案' },
  { value: '601', text: '从事进出境检疫处理业务的单位认定（A类）' },
  { value: '800', text: '准入肉类名单' },
  { value: '900', text: '进口肉类名录' },
];

export const CIQ_DANG_PACK_TYPE = [
  { value: '1', text: '一类' },
  { value: '2', text: '二类' },
  { value: '3', text: '三类' },
];

export const CIQ_TRANS_MEANS_TYPE = [
  { value: '20', text: '集装箱' },
  { value: '29', text: '船舱' },
  { value: '31', text: '车皮' },
];

export const CIQ_CNTNR_MODE_CODE = [
  { value: '111', text: '海运40尺普通' },
  { value: '112', text: '海运45尺普通' },
  { value: '121', text: '海运40尺冷藏' },
  { value: '122', text: '海运45尺冷藏' },
  { value: '131', text: '海运40尺罐式' },
  { value: '132', text: '海运45尺罐式' },
  { value: '201', text: '空运IKE(1.5X1.5X1.6)' },
  { value: '202', text: '空运DPE(1.15X1.5X1.6)' },
  { value: '203', text: '空运BJF(3.3X1.5X1.6)' },
  { value: '211', text: '海运20尺普通' },
  { value: '212', text: '海运25尺普通' },
  { value: '221', text: '海运20尺冷藏' },
  { value: '222', text: '海运25尺冷藏' },
  { value: '231', text: '海运20尺罐式' },
  { value: '232', text: '海运25尺罐式' },
  { value: '311', text: '列车40尺普通' },
  { value: '312', text: '列车40尺冷藏' },
  { value: '321', text: '列车20尺普通' },
  { value: '322', text: '列车20尺冷藏' },
  { value: '331', text: '列车10尺' },
];

export const CIQ_QTY_MEAS_UNIT = [
  { value: '000', text: '<无单位>' },
  { value: '001', text: '台' },
  { value: '002', text: '座' },
  { value: '003', text: '辆' },
  { value: '004', text: '艘' },
  { value: '005', text: '架' },
  { value: '006', text: '套' },
  { value: '007', text: '个' },
  { value: '008', text: '只' },
  { value: '009', text: '头' },
  { value: '010', text: '张' },
  { value: '011', text: '件' },
  { value: '012', text: '支' },
  { value: '013', text: '枝' },
  { value: '014', text: '根' },
  { value: '015', text: '条' },
  { value: '016', text: '把' },
  { value: '017', text: '块' },
  { value: '018', text: '卷' },
  { value: '019', text: '副ß' },
];

export const CIQ_WT_UNIT_CODE = [
  { value: '035', text: '千克' },
  { value: '036', text: '克' },
  { value: '047', text: '公担' },
  { value: '070', text: '吨' },
  { value: '071', text: '长吨' },
  { value: '072', text: '短吨' },
  { value: '073', text: '司马担' },
  { value: '074', text: '司马斤' },
  { value: '075', text: '斤' },
  { value: '076', text: '磅' },
  { value: '077', text: '担' },
  { value: '078', text: '英担' },
  { value: '079', text: '短担' },
  { value: '080', text: '两' },
  { value: '081', text: '市担' },
  { value: '083', text: '盎司' },
  { value: '084', text: '克拉' },
  { value: '150', text: '净吨' },
  { value: '545', text: '百吨' },
  { value: '546', text: '总吨' },
];

export const CIQ_GOODS_ATTR = [
  { value: '11', text: '3C目录内' },
  { value: '12', text: '3C目录外' },
  { value: '13', text: '无需办理3C认证' },
  { value: '14', text: '预包装' },
  { value: '15', text: '非预包装' },
  { value: '16', text: '转基因产品' },
  { value: '17', text: '非转基因产品' },
  { value: '18', text: '首次进出口' },
  { value: '19', text: '正常' },
  { value: '20', text: '废品' },
  { value: '21', text: '旧品' },
  { value: '22', text: '成套设备' },
  { value: '23', text: '带皮木材/板材' },
  { value: '24', text: '不带皮木材/板材' },
  { value: '25', text: 'A级特殊物品' },
  { value: '26', text: 'B级特殊物品' },
];

export const CIQ_GOODS_USE_TO = [
  { value: '11', text: '种用或繁殖' },
  { value: '12', text: '食用' },
  { value: '13', text: '奶用' },
  { value: '14', text: '观赏或演艺' },
  { value: '15', text: '伴侣' },
  { value: '16', text: '实验' },
  { value: '17', text: '药用' },
  { value: '18', text: '饲用' },
  { value: '19', text: '食品包装材料' },
  { value: '20', text: '食品加工设备' },
  { value: '21', text: '食品添加剂' },
  { value: '22', text: '介质土' },
  { value: '23', text: '食品容器' },
  { value: '24', text: '食品洗涤剂' },
  { value: '25', text: '食品消毒剂' },
  { value: '26', text: '仅工业用途' },
  { value: '27', text: '化妆品' },
  { value: '28', text: '化妆品原料' },
  { value: '29', text: '肥料' },
  { value: '30', text: '保健品' },
];

export const CIQ_DECL_STATUS = [
  { value: '0', text: '待报检' },
  { value: '1', text: '报检受理' },
  { value: '2', text: '施检查验' },
  { value: '3', text: '通关放行' },
  { value: '4', text: '签发证单' },
];

export const CMS_HSCODE_BRAND_TYPE = [
  { value: '0', text: '无品牌' },
  { value: '1', text: '境内自主品牌' },
  { value: '2', text: '境内收购品牌' },
  { value: '3', text: '境外品牌（贴牌生产）' },
  { value: '4', text: '境外品牌（其他）' },
];

export const CMS_HSCODE_EXPORT_PREFER = [
  { value: '0', text: '出口货物在最终目的国（地区）不享受优惠关税' },
  { value: '1', text: '出口货物在最终目的国（地区）享受优惠关税' },
  { value: '2', text: '出口货物不能确定在最终目的国（地区）享受优惠关税' },
  { value: '3', text: '不适用于进口报关单' },
];

export const CMS_DOC_TYPE = [
  { value: 'CUS_CERT', text: '海关随附单证' },
  { value: 'CUS_DOCU', text: '海关随附单据' },
  { value: 'CIQ_CERT', text: '国检企业、产品资质证书' },
  { value: 'CIQ_DOCU', text: '国检随附单据' },
  { value: 'CCD', text: '报关单' },
  { value: 'CID', text: '报检单' },
];
