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
  transport: {
    cls: 'transport',
    url: '/transport',
    text: 'moduleTransport'
  },
  forwarding: {
    cls: 'forwarding',
    url: '/forwarding',
    text: 'moduleForwarding'
  },
  inventory: {
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

const PARTNER_TENANT_TYPE = ['TENANT_ENTERPRISE', 'TENANT_BRANCH', 'TENANT_OFFLINE'];

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
export {
  __DEFAULT_PASSWORD__,
  DEFAULT_MODULES,
  APP_ENTITY_META_INFO,
  TENANT_ROLE,
  TENANT_LEVEL,
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
  FEE_TYPE
};
