import { defineMessages } from 'react-intl';

const messages = defineMessages({
  dashboardTitle: {
    id: 'scv.dashboard.title',
    defaultMessage: '看板',
  },
  orders: {
    id: 'scv.dashboard.orders',
    defaultMessage: '订单',
  },
  shipmentsStatus: {
    id: 'scv.dashboard.shipments.status',
    defaultMessage: '货运',
  },
  payments: {
    id: 'scv.dashboard.payments',
    defaultMessage: '结算',
  },
  alerts: {
    id: 'scv.dashboard.alerts',
    defaultMessage: '预警',
  },
  statistics: {
    id: 'scv.dashboard.statistics',
    defaultMessage: '统计',
  },
  atOrigin: {
    id: 'scv.dashboard.shipments.at.origin',
    defaultMessage: '启运地',
  },
  inTransit: {
    id: 'scv.dashboard.shipments.in.transit',
    defaultMessage: '海/空运输中',
  },
  arrived: {
    id: 'scv.dashboard.shipments.arrived',
    defaultMessage: '到港',
  },
  clearance: {
    id: 'scv.dashboard.shipments.clearance',
    defaultMessage: '清关',
  },
  inland: {
    id: 'scv.dashboard.shipments.inland',
    defaultMessage: '国内转运中',
  },
  delivered: {
    id: 'scv.dashboard.shipments.delivered',
    defaultMessage: '收货',
  },
  tax: {
    id: 'scv.dashboard.payments.tax',
    defaultMessage: '缴税',
  },
  freightBills: {
    id: 'scv.dashboard.payments.bills.freight',
    defaultMessage: '货代账单',
  },
  brokerBills: {
    id: 'scv.dashboard.payments.bills.brokder',
    defaultMessage: '报关行账单',
  },
});

export default messages;
