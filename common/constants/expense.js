export const TARIFF_KINDS = [{
  value: 'sales',
  text: '销售价',
}, {
  value: 'cost',
  text: '成本价',
}, {
  value: 'salesBase',
  text: '销售基准价',
  isBase: true,
}, {
  value: 'costBase',
  text: '成本基准价',
  isBase: true,
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
  color: '#d9d9d9',
  text: '全部费用',
}, {
  key: 'service',
  color: '#87d068',
  text: '服务费',
}, {
  key: 'advance',
  color: '#f8e411',
  text: '代垫费',
}, {
  key: 'special',
  color: '#f04a14',
  text: '特殊费用',
}];


export const EXPENSE_TYPES = [{
  key: 'customdecl',
  text: '报关',
}, {
  key: 'ciqdecl',
  text: '报检',
}, {
  key: 'transport',
  text: '运输',
}, {
  key: 'cert',
  text: '鉴定办证',
}];