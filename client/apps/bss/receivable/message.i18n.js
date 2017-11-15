import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  receivable: {
    id: 'bss.receivable',
    defaultMessage: '应收',
  },
  receivableBill: {
    id: 'bss.receivable.bill',
    defaultMessage: '客户账单',
  },
  receivableInvoice: {
    id: 'bss.receivable.invoice',
    defaultMessage: '开票管理',
  },
  paymentReceived: {
    id: 'bss.receivable.payment',
    defaultMessage: '收款管理',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
