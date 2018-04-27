import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  invoice: {
    id: 'bss.invoice',
    defaultMessage: '发票管理',
  },
  applyInvoice: {
    id: 'bss.invoice.applyInvoice',
    defaultMessage: '开票',
  },
  statusApplied: {
    id: 'bss.invoice.status.applied',
    defaultMessage: '已申请',
  },
  statusInvoiced: {
    id: 'bss.invoice.status.invoiced',
    defaultMessage: '已开具',
  },
  statusPaymentReceived: {
    id: 'bss.invoice.status.payment.received',
    defaultMessage: '已收款',
  },
  collectInvoice: {
    id: 'bss.invoice.payable',
    defaultMessage: '收票',
  },
  statusPending: {
    id: 'bss.invoice.status.pending',
    defaultMessage: '待核对',
  },
  statusConfirmed: {
    id: 'bss.invoice.status.confirmed',
    defaultMessage: '已核对',
  },
  statusPaymentMade: {
    id: 'bss.invoice.status.payment.made',
    defaultMessage: '已付款',
  },
  createInvoice: {
    id: 'bss.invoice.create',
    defaultMessage: '新建发票',
  },
  searchTips: {
    id: 'bss.invoice.search.tips',
    defaultMessage: '业务编号/客户编号',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
