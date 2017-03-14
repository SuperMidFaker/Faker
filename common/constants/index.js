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

export const KPI_CHART_COLORS = ['#CB809A', '#26B68E', '#109FDE', '#FFCE3B', '#8AC9D2', '#CB809A'];

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
};

export * from './module';
export * from './role';
export * from './transport';
export * from './expense';
export * from './crm';
export * from './cms';
