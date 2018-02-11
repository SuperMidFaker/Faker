import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'bss.module.dashboard',
    defaultMessage: '工作台',
  },
  settlement: {
    id: 'bss.module.settlement',
    defaultMessage: '费用结算',
  },
  feeSummary: {
    id: 'bss.module.fee.summary',
    defaultMessage: '费用汇总',
  },
  feeStatement: {
    id: 'bss.module.fee.statement',
    defaultMessage: '费用明细',
  },
  bills: {
    id: 'bss.module.bills',
    defaultMessage: '账单管理',
  },
  receivableInvoice: {
    id: 'bss.module.revenue.invoice',
    defaultMessage: '开票管理',
  },
  paymentReceived: {
    id: 'bss.module.revenue.payment',
    defaultMessage: '收款管理',
  },
  cost: {
    id: 'bss.module.cost',
    defaultMessage: '成本支出',
  },
  payableInvoice: {
    id: 'bss.module.cost.invoice',
    defaultMessage: '发票管理',
  },
  paymentMade: {
    id: 'bss.module.cost.payment',
    defaultMessage: '付款管理',
  },
  settings: {
    id: 'bss.module.settings',
    defaultMessage: '设置',
  },
  devApps: {
    id: 'bss.module.dev.apps',
    defaultMessage: '更多应用',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
