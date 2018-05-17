import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  voucher: {
    id: 'bss.payment',
    defaultMessage: '凭证管理',
  },
  receipt: {
    id: 'bss.payment.receipt',
    defaultMessage: '收款',
  },
  payment: {
    id: 'bss.payment.made',
    defaultMessage: '付款',
  },
  transfer: {
    id: 'bss.payment.transter',
    defaultMessage: '转账',
  },
  receivedPayment: {
    id: 'bss.payment.received',
    defaultMessage: '收款认领',
  },
  receiptVoucher: {
    id: 'bss.payment.receipt.payment',
    defaultMessage: '收款凭证',
  },
  paymentVoucher: {
    id: 'bss.payment.voucher',
    defaultMessage: '付款凭证',
  },
  transferVoucher: {
    id: 'bss.payment.transter.voucher',
    defaultMessage: '转账凭证',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
