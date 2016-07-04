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
  datacenter: {
    cls: 'datacenter',
    url: '/datacenter',
    text: 'moduleDatacenter'
  },
  integration: {
    cls: 'integration',
    url: '/integration',
    text: 'moduleIntegration'
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
  text: '木箱',
  value: '1'
}, {
  text: '纸箱',
  value: '2'
}, {
  text: '桶装',
  value: '3'
}, {
  text: '散装',
  value: '4'
}, {
  text: '托盘',
  value: '5'
}, {
  text: '包',
  value: '6'
}, {
  text: '其它',
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

const TRACKING_POINT_FROM_TYPE = {
  manual: 0,
  app: 1,
  gps: 2,
};

const SHIPMENT_POD_STATUS = {
  unrequired: 0,
  pending: 1,
  rejectByUs: -1,
  acceptByUs: 2,
  rejectByClient: -2,
  acceptByClient: 3,
};


const VEHICLE_STATUS = {
  disabled: {value: -1, text: '停用'},
  notUse: {value: 0, text: '不在途'},
  inUse: {value: 1, text: '在途'}
};

const VEHICLE_TYPES = [
  {value:0, text: '牵引'},
  {value:1, text: '厢式车'},
  {value:2, text: '低栏'},
  {value:3, text: '高栏'},
  {value:4, text: '平板'},
  {value:5, text: '集装箱'},
  {value:6, text: '罐式车'},
  {value:7, text: '冷藏'},
  {value:8, text: '超宽车'}
];

const VEHICLE_LENGTH_TYPES = [
  {value:0, text: '2米'},
  {value:1, text: '4.2米'},
  {value:2, text: '5.2米'},
  {value:3, text: '6.8米'},
  {value:4, text: '9.6米'},
  {value:5, text: '13米'},
  {value:6, text: '17.5米'},
];

const VPROPROTY_TYPES = {
  selfVehicle: {value: 0, text: '社会协作车辆'},
  publicVehicle: {value: 1, text: '公司自有车辆'}
};

const DRIVER_STATUS = {
  notUse: {value: 0, text: '不可用'},
  inUse: {value: 1, text: '可用'}
};

const GOODS_TYPES = [{
  value: 0,
  text: '普通货物'
}, {
  value: 1,
  text: '冷链'
}, {
  value: 2,
  text: '危险品'
}, {
  value: 3,
  text: '大件'
}];

const CONTAINER_PACKAGE_TYPE = [{
  key: 'GP20',
  value: 'GP20',
}, {
  key: 'GP40',
  value: 'GP40',
}, {
  key: 'HQ40',
  value: 'HQ40',
}];

const ENTERPRISE = 'enterprise';
const BRANCH = 'branch';
const PERSONNEL = 'personnel';
const CHINA_CODE = 'CN';
const MAX_STANDARD_TENANT = 10;

const RELATION_TYPES = [
  {key: 'forwarder', value: '收发货人'},
  {key: 'owner', value: '消费使用单位'},
  {key: 'trade', value: '申报单位'},
  {key: 'producer', value: '生产消费单位'}
];

const I_E_TYPES = [
  {key: 'I', value: '进口'},
  {key: 'E', value: '出口'},
  {key: 'A', value: '进出口'}
];

const CMS_BILL_STATUS = {
  undeclared: 0,
  declaring: 1,
  declared: 2,
};

const MESSAGE_STATUS = {
  notRead: {
    key: 0,
    value: '未读'
  },
  read: {
    key: 1,
    value: '已读'
  },
  delete3: {
    key: 3,
    value: '已删除'
  },
};

const WELOGIX_LOGO_URL = 'https://welogix-web-cdn.b0.upaiyun.com/assets/img/welogix-badge.png';
export {
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
  ENTERPRISE,
  BRANCH,
  PERSONNEL,
  CONDITION_STATE,
  WRAP_TYPE,
  FEE_TYPE,
  SHIPMENT_EFFECTIVES,
  SHIPMENT_SOURCE,
  SHIPMENT_TRACK_STATUS,
  SHIPMENT_POD_STATUS,
  SHIPMENT_VEHICLE_CONNECT,
  TRACKING_POINT_FROM_TYPE,
  PARTNERSHIP,
  VEHICLE_STATUS,
  VEHICLE_TYPES,
  VEHICLE_LENGTH_TYPES,
  VPROPROTY_TYPES,
  DRIVER_STATUS,
  GOODS_TYPES,
  CONTAINER_PACKAGE_TYPE,
  DELG_SOURCE,
  RELATION_TYPES,
  I_E_TYPES,
  CMS_BILL_STATUS,
  MESSAGE_STATUS,
  WELOGIX_LOGO_URL,
};
