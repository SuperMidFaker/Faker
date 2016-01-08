const __DEFAULT_PASSWORD__ = '123456';
const ACCOUNT_STATUS = {
  normal: '正常',
  blocked: '停用'
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
  'import': { cls: 'import', url: '/import', text: '进口' },
  'export': { cls: 'export', url: '/export', text: '出口' },
  'tms':    { cls: 'tms', url: '/tms', text: '运输' },
  'wms':    { cls: 'wms', url: '/wms', text: '仓储' },
  'payment':{ cls: 'payment', url: '/payment', text: '付汇' },
  'receipt':{ cls: 'receipt', url: '/receipt', text: '收汇' },
  'cost':   { cls: 'cost', url: '/cost', text: '成本分析' },
  'kpi':    { cls: 'kpi', url: '/kpi', text: 'KPI绩效' }
};

const TENANT_LEVEL = {
  STANDARD: 0,
  ENTERPRISE: 1,
  PLATFORM: 2
};
const CHINA_CODE = 'CN';

export {
  __DEFAULT_PASSWORD__,
  DEFAULT_MODULES,
  TENANT_LEVEL,
  CHINA_CODE,
  ACCOUNT_STATUS,
  SMS_TYPE,
  ADMIN,
  ENTERPRISE,
  BRANCH,
  PERSONNEL
};
