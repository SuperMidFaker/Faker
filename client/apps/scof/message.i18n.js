import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  dashboard: {
    id: 'sof.module.dashboard',
    defaultMessage: '工作台',
  },
  shipments: {
    id: 'sof.module.shipments',
    defaultMessage: '货运订单',
  },
  invoices: {
    id: 'sof.module.invoices',
    defaultMessage: '商业发票',
  },
  purchaseOrders: {
    id: 'sof.module.purchase.orders',
    defaultMessage: '采购订单',
  },
  tracking: {
    id: 'sof.module.tracking',
    defaultMessage: '追踪报表',
  },
  customizeTracking: {
    id: 'sof.module.tracking.customize',
    defaultMessage: '自定义追踪表',
  },
  customers: {
    id: 'sof.module.partner.customers',
    defaultMessage: '客户',
  },
  suppliers: {
    id: 'sof.module.partner.suppliers',
    defaultMessage: '供应商',
  },
  vendors: {
    id: 'sof.module.partner.vendors',
    defaultMessage: '服务商',
  },
  flow: {
    id: 'sof.module.flow',
    defaultMessage: '流程',
  },
  settings: {
    id: 'sof.module.settings',
    defaultMessage: '设置',
  },
  devApps: {
    id: 'sof.module.dev.apps',
    defaultMessage: '更多应用',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
