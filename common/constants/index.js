const ACCOUNT_STATUS = {
  normal: {
    id: 0,
    name: 'normal',
    text: 'accountNormal',
  },
  blocked: {
    id: 1,
    name: 'blocked',
    text: 'accountDisabled',
  },
};

const TENANT_ASPECT = {
  BO: 0, // 企业主
  SP: 1, // 服务商
};
const TENANT_LEVEL = {
  STANDARD: 0,
  ENTERPRISE: 1,
  PLATFORM: 2,
};
const PARTNER_TENANT_TYPE = ['TENANT_BRANCH', 'TENANT_ENTERPRISE', 'TENANT_EXT', 'TENANT_OFFLINE'];

const INVITATION_STATUS = {
  NEW_SENT: 0,
  ACCEPTED: 1,
  REJECTED: 2,
  CANCELED: 3, // 取消邀请
};

export const PARTNER_ROLES = {
  DCUS: 'DCUS',
  CUS: 'CUS',
  SUP: 'SUP',
};

export const PARTNER_BUSINESSES = {
  CCB: 'CCB',
  TRS: 'TRS',
  CIB: 'CIB',
  ICB: 'ICB',
};

export const PARTNER_BUSINESSE_TYPES = {
  clearance: 'clearance',
  transport: 'transport',
};

const WRAP_TYPE = [{
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

const DELG_SOURCE = {
  consigned: 1,       // 委托
  subcontracted: 2,   // 分包
};

const DELG_STATUS = {
  undelg: 0,
  unaccepted: 1,
  undeclared: 2,
  declared: 3,
  finished: 4,
};

const GOODSTYPES = [{
  value: 0,
  text: '普通货',
}, {
  value: 1,
  text: '冷冻品',
}, {
  value: 2,
  text: '危险品',
}];

const CHINA_CODE = 'CN';
const MAX_STANDARD_TENANT = 10;

const RELATION_TYPES = [
  { key: 'trade', value: '收发货人' },
  { key: 'owner_consumer', value: '消费使用单位' },
  { key: 'owner_producer', value: '生产销售单位' },
  { key: 'agent', value: '申报单位' },
];

const I_E_TYPES = [
  { key: 'I', value: '进口' },
  { key: 'E', value: '出口' },
  { key: 'A', value: '进出口' },
];

const DECL_I_TYPE = [
  { key: '0000', value: '口岸进口' },
  { key: '0100', value: '保税区进口' },
  { key: '0102', value: '保税区进境备案' },
];

const DECL_E_TYPE = [
  { key: '0001', value: '口岸出口' },
  { key: '0101', value: '保税区出口' },
  { key: '0103', value: '保税区出境备案' },
];

const CMS_DELG_STATUS = [
  { value: 0, text: '待接单' },
  { value: 1, text: '已接单' },
  { value: 2, text: '制单中' },
  { value: 3, text: '已申报' },
  { value: 4, text: '已放行' },
  { value: 5, text: '已结单' },
];
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
  { value: '2', text: '海运' },
  { value: '5', text: '空运' },
  { value: '9', text: '其他' },
];
export const INVOICE_TYPE = [
  { value: 0, text: '增值税专用发票' },
  { value: 1, text: '增值税普通发票' },
];
export const CMS_SUP_STATUS = [
  { value: 0, text: '待供应商接单' },
  { value: 1, text: '供应商已接单' },
  { value: 2, text: '供应商制单中' },
  { value: 3, text: '已申报' },
  { value: 4, text: '已放行' },
];

export const CMS_DELEGATION_STATUS = {
  unaccepted: 0,
  accepted: 1,
  processing: 2,
  declaring: 3,
  released: 4,
  completed: 5,
};

export const CMS_BILL_STATUS = {
  undeclared: 0,
  declaring: 1,
  declared: 2,
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

const MESSAGE_STATUS = {
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
  { value: 0, text: '[空]' },
  { value: 1, text: '率' },
  { value: 2, text: '单价' },
  { value: 3, text: '总价' },
];

export const CMS_CONFIRM = [
  { value: 0, text: '否' },
  { value: 1, text: '是' },
];

export const CMS_DECL_DOCU = [
  { value: '0', text: '发票' },
  { value: '1', text: '装箱单' },
  { value: '2', text: '提运单' },
  { value: '3', text: '合同' },
  { value: '4', text: '代理报关委托协议' },
  { value: '5', text: '电子代理委托协议' },
  { value: '6', text: '减免税货物税款担保证明' },
  { value: '7', text: '减免税货物税款担保延期证明' },
  { value: '8', text: '其他1' },
  { value: '9', text: '其他2' },
  { value: 'a', text: '其他3' },
];

export {
  TENANT_LEVEL,
  TENANT_ASPECT,
  INVITATION_STATUS,
  MAX_STANDARD_TENANT,
  PARTNER_TENANT_TYPE,
  CHINA_CODE,
  ACCOUNT_STATUS,
  WRAP_TYPE,
  GOODSTYPES,
  DELG_SOURCE,
  RELATION_TYPES,
  I_E_TYPES,
  DECL_I_TYPE,
  DECL_E_TYPE,
  MESSAGE_STATUS,
  CMS_DELG_STATUS,
  DELG_STATUS,
};

export * from './module';
export * from './role';
export * from './transport';
export * from './expense';
export * from './crm';
