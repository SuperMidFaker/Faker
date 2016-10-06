import { defineMessages } from 'react-intl';

const messages = defineMessages({
  dashboard: {
    id: 'scv.module.dashboard',
    defaultMessage: '看板',
  },
  orders: {
    id: 'scv.module.orders',
    defaultMessage: '订单',
  },
  inboundShipments: {
    id: 'scv.module.shipments.inbound',
    defaultMessage: '进口追踪',
  },
  outboundShipments: {
    id: 'scv.module.shipments.outbound',
    defaultMessage: '出口追踪',
  },
  payment: {
    id: 'scv.module.payment',
    defaultMessage: '结算中心',
  },
  taxPayment: {
    id: 'scv.module.payment.tax',
    defaultMessage: '税费支付',
  },
  billingPayment: {
    id: 'scv.module.payment.billing',
    defaultMessage: '账单支付',
  },
  analytics: {
    id: 'scv.module.analytics',
    defaultMessage: '统计',
  },
  kpiAnalytics: {
    id: 'scv.module.analytics.kpi',
    defaultMessage: '绩效分析',
  },
  costAnalytics: {
    id: 'scv.module.analytics.cost',
    defaultMessage: '成本分析',
  },
  settings: {
    id: 'scv.module.settings',
    defaultMessage: '设置',
  },
});

export default messages;
