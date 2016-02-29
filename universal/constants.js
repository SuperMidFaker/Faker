const __DEFAULT_PASSWORD__ = '123456';
const ACCOUNT_STATUS = {
  normal: {
    id: 0,
    name: 'normal',
    text: '正常'
  },
  blocked: {
    id: 1,
    name: 'blocked',
    text: '停用'
  }
};
const TENANT_ROLE = {
  owner: {
    name: 'owner',
    text: '拥有者'
  },
  manager: {
    name: 'manager',
    text: '管理员'
  },
  member: {
    name: 'member',
    text: '成员'
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
  import: { cls: 'import', url: '/import', text: '进口' },
  export: { cls: 'export', url: '/export', text: '出口' },
  tms:    { cls: 'tms', url: '/tms', text: '运输' },
  wms:    { cls: 'wms', url: '/wms', text: '仓储' },
  payable:{ cls: 'payable', url: '/payable', text: '付汇' },
  receivable:{ cls: 'receivable', url: '/receivable', text: '收汇' },
  cost:   { cls: 'cost', url: '/cost', text: '成本分析' },
  kpi:    { cls: 'kpi', url: '/kpi', text: 'KPI绩效' }
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

export {
  __DEFAULT_PASSWORD__,
  DEFAULT_MODULES,
  TENANT_ROLE,
  TENANT_LEVEL,
  INVITATION_STATUS,
  MAX_STANDARD_TENANT,
  CHINA_CODE,
  ACCOUNT_STATUS,
  SMS_TYPE,
  ADMIN,
  ENTERPRISE,
  BRANCH,
  PERSONNEL
};
