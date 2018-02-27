export const TARIFF_KINDS = [{
  value: 'sales',
  text: '客户报价',
}, {
  value: 'cost',
  text: '服务商报价',
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

export const TAX_MODE = {
  eachwaybill: {
    key: 0,
    value: '按照每运单',
  },
  chargeunit: {
    key: 1,
    value: '按运单计费单位',
  },
};

export const TAX_STATUS = {
  exctax: {
    key: 0,
    value: '运费含税',
  },
  inctax: {
    key: 1,
    value: '运费不含税',
  },
};

export const EXPENSE_CATEGORIES = [{
  key: 'all',
  color: '#989898',
  text: '全部费用',
}, {
  key: 'service',
  color: '#87d068',
  text: '服务费',
}, {
  key: 'advance',
  color: '#f78e3d',
  text: '代垫费',
}, {
  key: 'special',
  color: '#f50',
  text: '特殊费用',
}];


export const CMS_EXPENSE_TYPES = [{
  key: 'customdecl',
  text: '报关',
}, {
  key: 'ciqdecl',
  text: '报检',
}, {
  key: 'cert',
  text: '鉴定办证',
}];

export const TMS_EXPENSE_TYPES = [{
  key: 'transport_expenses',
  text: '运费',
}, {
  key: 'misc_expenses',
  text: '杂项',
}, {
  key: 'custom',
  text: '自定义',
}];

export const CMS_DELG_EXPENSE_STATUS = {
  pending: 0,
  estimated: 1,
  closed: 2,
  billed: 3,
  invoiced: 4,
  settled: 5,
};
