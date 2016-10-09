import { defineMessages } from 'react-intl';

const messages = defineMessages({
  analyticsCost: {
    id: 'scv.analytics.cost',
    defaultMessage: '成本分析',
  },
  totalLandedCost: {
    id: 'scv.analytics.cost.total.landed',
    defaultMessage: '总成本',
  },
  expenses: {
    id: 'scv.analytics.cost.expenses',
    defaultMessage: '费用',
  },
  freight: {
    id: 'scv.analytics.cost.expenses.freight',
    defaultMessage: '国际运输',
  },
  clearance: {
    id: 'scv.analytics.cost.expenses.clearance',
    defaultMessage: '清关',
  },
  inland: {
    id: 'scv.analytics.cost.expenses.inland',
    defaultMessage: '国内运输',
  },
  taxes: {
    id: 'scv.analytics.cost.taxes',
    defaultMessage: '税费',
  },
  duties: {
    id: 'scv.analytics.cost.taxes.duties',
    defaultMessage: '关税',
  },
  vat: {
    id: 'scv.analytics.cost.taxes.vat',
    defaultMessage: '增值税',
  },
  comsuption: {
    id: 'scv.analytics.cost.taxes.comsuption',
    defaultMessage: '消费税',
  },
  otherTaxes: {
    id: 'scv.analytics.cost.taxes.other',
    defaultMessage: '其它税费',
  },
  allocByOrder: {
    id: 'scv.analytics.cost.alloc.by.order',
    defaultMessage: '按订单分摊',
  },
  allocBySku: {
    id: 'scv.analytics.cost.alloc.by.sku',
    defaultMessage: '按SKU分摊',
  },
});

export default messages;
