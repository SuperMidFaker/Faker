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
const PARTNERSHIP_TYPE_INFO = {
  customer: 'CUS',
  customsClearanceBroker: 'CCB',
  freightForwarder: 'FWD',
  transportation: 'TRS',
  warehouse: 'WHS',
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

const SHIPMENT_EFFECTIVES = {
  cancelled: -1,
  draft: 0,
  effected: 1,
  archived: 2,
};

const SHIPMENT_SOURCE = {
  consigned: 1,       // 委托
  subcontracted: 2,   // 分包
};

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

const SHIPMENT_TRACK_STATUS = {
  unaccepted: 1,
  accepted: 2,
  dispatched: 3,
  intransit: 4,
  delivered: 5,
  podsubmit: 6,
  podaccept: 7,
};
const SHIPMENT_VEHICLE_CONNECT = {
  disconnected: 0,
  app: 1,
  g7: 2,
};

const TRACKING_POINT_FROM_TYPE = {
  manual: 0,
  app: 1,
  gps: 2,
};

const SHIPMENT_POD_STATUS = {
  unsubmit: 0,
  pending: 1,
  rejectByUs: -1,
  acceptByUs: 2,
  rejectByClient: -2,
  acceptByClient: 3,
};

const VEHICLE_STATUS = {
  disabled: { value: -1, text: '停用' },
  notUse: { value: 0, text: '不在途' },
  inUse: { value: 1, text: '在途' },
};

const DRIVER_STATUS = {
  notUse: { value: 0, text: '不可用' },
  inUse: { value: 1, text: '可用' },
};

const GOODS_TYPES = [{
  value: 0,
  text: '普通货物',
}, {
  value: 1,
  text: '温控货物',
}, {
  value: 2,
  text: '危险品',
}, {
  value: 3,
  text: '大件货物',
}];

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

const CONTAINER_PACKAGE_TYPE = [{
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

export const TARIFF_KINDS = [{
  value: 'sales',
  text: '销售价',
}, {
  value: 'cost',
  text: '成本价',
}, {
  value: 'salesBase',
  text: '销售基准价',
  isBase: true,
}, {
  value: 'costBase',
  text: '成本基准价',
  isBase: true,
}];

export const TARIFF_METER_METHODS = [{
  value: 'kg',
  text: '公斤单价',
}, {
  value: 't',
  text: '吨单价',
}, {
  value: 'm3',
  text: '立方米单价',
}, {
  value: 't*km',
  text: '吨*公里系数',
}];

export const PRESET_TRANSMODES = {
  ftl: 'FTL', // 整车
  exp: 'EXP', // 快递
  ltl: 'LTL', // 零担
  ctn: 'CTN', // 集装箱
};

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
  { key: '0002', value: '进境' },
  { key: '0100', value: '保税区进口' },
  { key: '0102', value: '保税区进境备案' },
  { key: '0200', value: '寄售维修进口' },
  { key: '0202', value: '寄售维修进境备案' },
];

const DECL_E_TYPE = [
  { key: '0001', value: '口岸出口' },
  { key: '0101', value: '保税区出口' },
  { key: '0103', value: '出境' },
  { key: '0102', value: '保税区出境备案' },
  { key: '0201', value: '寄售维修出口' },
  { key: '0203', value: '寄售维修出境备案' },
];

const CMS_DELG_STATUS = [
  { value: 0, text: '待接单' },
  { value: 1, text: '已接单' },
  { value: 2, text: '制单中' },
  { value: 3, text: '已申报' },
  { value: 4, text: '已放行' },
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
  declaring: 2,
  declared: 3,
  passed: 4,
};

export const CMS_BILL_STATUS = {
  undeclared: 0,
  declaring: 1,
  declared: 2,
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

const TAX_MODE = {
  eachwaybill: {
    key: 0,
    value: '按照每运单',
  },
  chargeunit: {
    key: 1,
    value: '按运单计费单位',
  },
};

const TAX_STATUS = {
  exctax: {
    key: 0,
    value: '运费含税',
  },
  inctax: {
    key: 1,
    value: '运费不含税',
  },
};

export {
  TENANT_LEVEL,
  TENANT_ASPECT,
  INVITATION_STATUS,
  MAX_STANDARD_TENANT,
  PARTNERSHIP_TYPE_INFO,
  PARTNER_TENANT_TYPE,
  CHINA_CODE,
  ACCOUNT_STATUS,
  WRAP_TYPE,
  SHIPMENT_EFFECTIVES,
  SHIPMENT_SOURCE,
  SHIPMENT_TRACK_STATUS,
  SHIPMENT_POD_STATUS,
  SHIPMENT_VEHICLE_CONNECT,
  TRACKING_POINT_FROM_TYPE,
  VEHICLE_STATUS,
  DRIVER_STATUS,
  GOODS_TYPES,
  GOODSTYPES,
  CONTAINER_PACKAGE_TYPE,
  DELG_SOURCE,
  RELATION_TYPES,
  I_E_TYPES,
  DECL_I_TYPE,
  DECL_E_TYPE,
  MESSAGE_STATUS,
  CMS_DELG_STATUS,
  TAX_MODE,
  TAX_STATUS,
  DELG_STATUS,
};

export * from './module';
export * from './privilege';
