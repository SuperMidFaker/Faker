import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  payable: {
    id: 'bss.payable',
    defaultMessage: '应付',
  },
  payableBill: {
    id: 'bss.payable.bill',
    defaultMessage: '供应商账单',
  },
  payableInvoice: {
    id: 'bss.payable.invoice',
    defaultMessage: '发票管理',
  },
  paymentMade: {
    id: 'bss.payable.payment',
    defaultMessage: '付款管理',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
