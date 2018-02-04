import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  invoices: {
    id: 'scof.invoices',
    defaultMessage: '商业发票',
  },
  createInvoice: {
    id: 'scof.invoices.create',
    defaultMessage: '新建发票',
  },
  importInvoices: {
    id: 'scof.invoices.import',
    defaultMessage: '导入发票',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
