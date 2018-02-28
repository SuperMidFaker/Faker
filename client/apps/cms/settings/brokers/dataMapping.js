export const partnerTypes = {
  CUS: '客户',
  SUP: '供应商',
  TRS: '承运商',
  WHS: '仓储提供商',
  CCB: '报关行',
  FWD: '货代',
  ALL: '物流提供商',
  CIB: '报检提供商',
  ICB: '鉴定办证',
};

export const providerShorthandTypes = {
  TRS: '运输',
  WHS: '仓储',
  CCB: '报关',
  FWD: '货代',
  CIB: '报检',
  ICB: '鉴定办证',
};

export function mapPartnerships(partnerships) {
  let content;
  if (partnerships.length === 1) {
    content = partnerTypes[partnerships[0]];
  } else {
    content = `${partnerships.map(ps => providerShorthandTypes[ps]).join('/')}`;
  }
  return content;
}
