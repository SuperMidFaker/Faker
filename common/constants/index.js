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
  VEN: 'VEN',
};

export const PARTNER_BUSINESSES = {
  CCB: 'CCB',
  TRS: 'TRS',
  FWD: 'FWD',
  WHS: 'WHS',
};

export const PARTNER_BUSINESSE_TYPES = {
  clearance: 'clearance',
  transport: 'transport',
  warehousing: 'warehousing',
};

export const KPI_CHART_COLORS = ['#CB809A', '#26B68E', '#109FDE', '#FFCE3B', '#8AC9D2', '#CB809A'];

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
};

export const PROMPT_TYPES = {
  promptAccept: 'promptAccept',
  promptDispatch: 'promptDispatch',
  promptDriverPickup: 'promptDriverPickup',
  promptSpPickup: 'promptSpPickup',
  promptDriverPod: 'promptDriverPod',
  promptSpPod: 'promptSpPod',
};

export const BUSINESS_TYPES = [
  { label: '清关', value: 'clearance' },
  { label: '仓储', value: 'warehousing' },
  { label: '运输', value: 'transport' },
];

export * from './module';
export * from './role';
export * from './transport';
export * from './expense';
export * from './crm';
export * from './cms';
export * from './flow';
export * from './classification';
export * from './scv';
export * from './cwm';
export * from './lineAdaptor';
export * from './operationLog';
export * from './hub';
export * from './bss';
export * from './uploadRecords';
