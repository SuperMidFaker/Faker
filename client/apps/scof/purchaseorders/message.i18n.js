import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  purchaseOrders: {
    id: 'sof.purchase.orders',
    defaultMessage: '采购订单',
  },
  createInvoice: {
    id: 'sof.purchase.orders.create',
    defaultMessage: '新建采购订单',
  },
  batchImportInvoices: {
    id: 'sof.purchase.orders.batch.import',
    defaultMessage: '导入采购',
  },
  toShip: {
    id: 'sof.purchase.orders.status.to.ship',
    defaultMessage: '待发货',
  },
  partialShipped: {
    id: 'sof.purchase.orders.status.partial.shipped',
    defaultMessage: '部分发货',
  },
  shipped: {
    id: 'sof.purchase.orders.status.shipped',
    defaultMessage: '已发货',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
