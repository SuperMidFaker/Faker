import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

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
  toShip: {
    id: 'scof.invoices.status.to.ship',
    defaultMessage: '待发货',
  },
  partialShipped: {
    id: 'scof.invoices.status.partial.shipped',
    defaultMessage: '部分发货',
  },
  shipped: {
    id: 'scof.invoices.status.shipped',
    defaultMessage: '已发货',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
