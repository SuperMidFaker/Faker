import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  bills: {
    id: 'bss.bills',
    defaultMessage: '账单管理',
  },
  customerBills: {
    id: 'bss.bills.customer.bills',
    defaultMessage: '客户账单',
  },
  vendorBills: {
    id: 'bss.bills.vendor.bills',
    defaultMessage: '服务商账单',
  },
  billsStatus: {
    id: 'bss.bills.status',
    defaultMessage: '账单状态',
  },
  statusDraft: {
    id: 'bss.bills.status.draft',
    defaultMessage: '草稿',
  },
  statusPending: {
    id: 'bss.bills.status.pending',
    defaultMessage: '待对账',
  },
  statusAccepted: {
    id: 'bss.bills.status.accepted',
    defaultMessage: '已接受',
  },
  statusOffline: {
    id: 'bss.bills.status.offline',
    defaultMessage: '线下账单',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
