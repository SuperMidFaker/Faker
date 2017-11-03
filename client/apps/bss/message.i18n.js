import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'bss.module.dashboard',
    defaultMessage: '工作台',
  },
  fee: {
    id: 'bss.module.fee',
    defaultMessage: '费用',
  },
  feeSummary: {
    id: 'bss.module.fee.summary',
    defaultMessage: '费用汇总',
  },
  feeStatement: {
    id: 'bss.module.fee.statement',
    defaultMessage: '费用明细',
  },
  receivable: {
    id: 'bss.module.receivable',
    defaultMessage: '应收',
  },
  customerBill: {
    id: 'bss.module.receivable.customer.bill',
    defaultMessage: '客户账单',
  },
  receivableInvoice: {
    id: 'bss.module.receivable.invoice',
    defaultMessage: '开票管理',
  },
  paymentReceived: {
    id: 'bss.module.receivable.payment',
    defaultMessage: '收款管理',
  },
  payable: {
    id: 'bss.module.payable',
    defaultMessage: '应付',
  },
  vendorBill: {
    id: 'bss.module.payable.vendor.bill',
    defaultMessage: '供应商账单',
  },
  payableInvoice: {
    id: 'bss.module.payable.invoice',
    defaultMessage: '发票管理',
  },
  paymentMade: {
    id: 'bss.module.payable.payment',
    defaultMessage: '付款管理',
  },
  settings: {
    id: 'bss.module.settings',
    defaultMessage: '设置',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
