const __DEFAULT_PASSWORD__ = '123456';
const ACCOUNT_STATUS = {
  normal: {
    id: 0,
    name: 'normal',
    text: 'accountNormal'
  },
  blocked: {
    id: 1,
    name: 'blocked',
    text: 'accountDisabled'
  }
};
const DELEGATE_STATUS = {
  normal: {
    id: 0,
    name: 'normal',
    text: '待处理'
  },
  blocked: {
    id: 3,
    name: 'blocked',
    text: '停用'
  },
  send: {
    id: 1,
    name: 'send',
    text: '未受理'
  },
  accept: {
    id: 2,
    name: 'accept',
    text: '已接单'
  }
};
const TENANT_ROLE = {
  owner: {
    name: 'owner',
    text: 'tenantOwner'
  },
  manager: {
    name: 'manager',
    text: 'tenantManager'
  },
  member: {
    name: 'member',
    text: 'tenantMember'
  }
};

const TENANT_ASPECT = {
  BO: 0, // 企业主
  SP: 1, // 服务商
};
const TENANT_USEBOOK = {
  owner: {
    name: 2,
    text: '拥有者'
  },
  manager: {
    name: 1,
    text: '是'
  },
  member: {
    name: 0,
    text: '否'
  }
};
const ADMIN = 'admin';
const ENTERPRISE = 'enterprise';
const BRANCH = 'branch';
const PERSONNEL = 'personnel';
const SMS_TYPE = {
  REG: 1,
  LOGIN: 2,
  RESET_PWD: 3,
  WEB_LOGIN_PWD_FORGET: 4,
  CHANGE_PHONE: 5,
  CHANGE_PAID_PASSWORD: 6
};
const DEFAULT_MODULES = {
  import: {
    cls: 'import',
    url: '/import',
    text: 'moduleImport'
  },
  export: {
    cls: 'export',
    url: '/export',
    text: 'moduleExport'
  },
  tms: {
    cls: 'transport',
    url: '/transport',
    text: 'moduleTransport'
  },
  forwarding: {
    cls: 'forwarding',
    url: '/forwarding',
    text: 'moduleForwarding'
  },
  wms: {
    cls: 'inventory',
    url: '/inventory',
    text: 'moduleInventory'
  },
  tracking: {
    cls: 'tracking',
    url: '/tracking',
    text: 'moduleTracking'
  },
  cost: {
    cls: 'cost',
    url: '/cost',
    text: 'moduleCost'
  },
  performance: {
    cls: 'performance',
    url: '/performance',
    text: 'modulePerformance'
  }
};

const APP_ENTITY_META_INFO = {
  import: {
    name: 'importApp',
    desc: 'importAppDesc'
  },
  export: {
    name: 'exportApp',
    desc: 'exportAppDesc'
  },
  tms: {
    name: 'tmsApp',
    desc: 'tmsAppDesc'
  },
  wms: {
    name: 'wmsApp',
    desc: 'wmsAppDesc'
  }
};

const TENANT_LEVEL = {
  STANDARD: 0,
  ENTERPRISE: 1,
  PLATFORM: 2
};
const CHINA_CODE = 'CN';
const MAX_STANDARD_TENANT = 10;
const INVITATION_STATUS = {
  NEW_SENT: 0,
  ACCEPTED: 1,
  REJECTED: 2,
  CANCELED: 3 // 取消邀请
};

const PARTNERSHIP_TYPE_INFO = {
  customer: 'CUS',
  customsClearanceBroker: 'CCB',
  freightForwarder: 'FWD',
  transportation: 'TRS',
  warehouse: 'WHS'
};

const PARTNERSHIP = {
  CUS: 0,
  CCB: 1,
  FWD: 2,
  TRS: 3,
  WHS: 4,
  SUP: 5
};

const PARTNER_TENANT_TYPE = ['TENANT_ENTERPRISE', 'TENANT_BRANCH', 'TENANT_EXT', 'TENANT_OFFLINE'];

const CONDITION_STATE = [{
  text: '1|是',
  value: '1'
}, {
  text: '0|否',
  value: '0'
}];

const WRAP_TYPE = [{
  text: '1|木箱',
  value: '1'
}, {
  text: '2|纸箱',
  value: '2'
}, {
  text: '3|桶装',
  value: '3'
}, {
  text: '4|散装',
  value: '4'
}, {
  text: '5|托盘',
  value: '5'
}, {
  text: '6|包',
  value: '6'
}, {
  text: '7|其它',
  value: '7'
}];
const FEE_TYPE = [{
  text: '1|率',
  value: '1'
}, {
  text: '2|单价',
  value: '2'
}, {
  text: '3|总价',
  value: '3'
}];

const CONSIGN_TYPE = {
  consigner: 0,
  consignee: 1,
};

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

const SHIPMENT_DISPATCH_STATUS = {
  unconfirmed: 0,
  confirmed: 1,
  cancel: 2,
};

const SHIPMENT_TRACK_STATUS = {
  unaccepted: 1,
  undispatched: 2,
  undelivered: 3,
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

const SHIPMENT_POD_STATUS = {
  unrequired: 0,
  pending: 1,
  rejectByUs: -1,
  acceptByUs: 2,
  rejectByClient: -2,
  acceptByClient: 3,
};

const SHIPMENT_POD_TYPE = {
  qrcode: 1,
  paperprint: 2,
};

const VEHICLE_STATUS = {
  disabled: {value: -1, text: '停用'},
  notUse: {value: 0, text: '不在途'},
  inUse: {value: 1, text: '在途'}
};

const VEHICLE_TYPES = [
  {value:1, text: '牵引'},
  {value:2, text: '厢式车'},
  {value:3, text: '低栏'},
  {value:4, text: '高栏'},
  {value:5, text: '平板'},
  {value:6, text: '集装箱'},
  {value:7, text: '罐式车'},
  {value:8, text: '冷藏'},
  {value:9, text: '超宽车'}
];

const VEHICLE_LENGTH_TYPES = [
  {value:1, text: '2.0'},
  {value:2, text: '4.2'},
  {value:3, text: '5.2'},
  {value:4, text: '6.8'},
  {value:5, text: '9.6'},
  {value:6, text: '13'},
  {value:7, text: '17.5'},
];

const VPROPROTY_TYPES = {
  selfVehicle: {value: 0, text: '司机自有车辆'},
  publicVehicle: {value: 1, text: '公有车辆'}
};

const DRIVER_STATUS = {
  notUse: {value: 0, text: '不可用'},
  inUse: {value: 1, text: '可用'}
};

const GOODS_TYPES = [{
  value: '1',
  name: '普通货物'
}, {
  value: '2',
  name: '冷链'
}, {
  value: '3',
  name: '危险品'
}, {
  value: '4',
  name: '大件'
}];

export {
  __DEFAULT_PASSWORD__,
  DEFAULT_MODULES,
  APP_ENTITY_META_INFO,
  TENANT_ROLE,
  TENANT_LEVEL,
  TENANT_ASPECT,
  INVITATION_STATUS,
  MAX_STANDARD_TENANT,
  PARTNERSHIP_TYPE_INFO,
  PARTNER_TENANT_TYPE,
  CHINA_CODE,
  ACCOUNT_STATUS,
  SMS_TYPE,
  ADMIN,
  ENTERPRISE,
  BRANCH,
  PERSONNEL,
  DELEGATE_STATUS,
  TENANT_USEBOOK,
  CONDITION_STATE,
  WRAP_TYPE,
  FEE_TYPE,
  CONSIGN_TYPE,
  SHIPMENT_EFFECTIVES,
  SHIPMENT_SOURCE,
  SHIPMENT_DISPATCH_STATUS,
  SHIPMENT_TRACK_STATUS,
  SHIPMENT_POD_STATUS,
  SHIPMENT_VEHICLE_CONNECT,
  SHIPMENT_POD_TYPE,
  PARTNERSHIP,
  VEHICLE_STATUS,
  VEHICLE_TYPES,
  VEHICLE_LENGTH_TYPES,
  VPROPROTY_TYPES,
  DRIVER_STATUS,
  GOODS_TYPES
};
