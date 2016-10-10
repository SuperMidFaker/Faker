import { defineMessages } from 'react-intl';

const messages = defineMessages({
  analyticsKpi: {
    id: 'scv.analytics.kpi',
    defaultMessage: '绩效分析',
  },
  sectionServiceProvider: {
    id: 'scv.analytics.kpi.service',
    defaultMessage: '服务提供商KPI',
  },
  ontimeDelivery: {
    id: 'scv.analytics.kpi.service.ontime.delivery',
    defaultMessage: '准时交付率',
  },
  brokerHandling: {
    id: 'scv.analytics.kpi.service.broker.handling',
    defaultMessage: '报关行操作',
  },
  sectionInspection: {
    id: 'scv.analytics.kpi.inspection',
    defaultMessage: '查验率KPI',
  },
  customsInspection: {
    id: 'scv.analytics.kpi.inspection.customs',
    defaultMessage: '海关查验率',
  },
  ciqInspection: {
    id: 'scv.analytics.kpi.inspection.ciq',
    defaultMessage: '商检查验率',
  },

});

export default messages;
