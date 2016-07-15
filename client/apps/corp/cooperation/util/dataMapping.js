export const partnerTypes = {
  CUS: '客户',
  SUP: '供应商',
  TRS: '运输提供商',
  WHS: '仓储提供商',
  CCB: '报关提供商',
  FWD: '货代提供商',
  ALL: '物流提供商',
};

export const providerShorthandTypes = {
  TRS: '运输',
  WHS: '仓储',
  CCB: '报关',
  FWD: '货代',
};

export const tenantTypes = {
  TENANT_ENTERPRISE: '企业租户',
  TENANT_BRANCH: '企业子租户',
  TENANT_EXT: '扩展租户',
  TENANT_OFFLINE: '非平台租户',
};

export function mapPartnerships(partnerships) {
  let content;
  if (partnerships.length === 1) {
    content = partnerTypes[partnerships[0]];
  } else {
    content = `${partnerships.map(ps => providerShorthandTypes[ps]).join('/')}提供商`;
  }
  return content;
}
