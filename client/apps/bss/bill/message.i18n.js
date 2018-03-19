import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  bill: {
    id: 'bss.bill',
    defaultMessage: '账单管理',
  },
  buyerBill: {
    id: 'bss.bill.buyer.bill',
    defaultMessage: '客户账单',
  },
  sellerBill: {
    id: 'bss.bill.seller.bill',
    defaultMessage: '服务商账单',
  },
  expense: {
    id: 'bss.bill.expense',
    defaultMessage: '费用',
  },
  confirmedExpense: {
    id: 'bss.bill.expense.confirmed',
    defaultMessage: '未入账单的费用',
  },
  billsStatus: {
    id: 'bss.bill.status',
    defaultMessage: '账单状态',
  },
  statusDraft: {
    id: 'bss.bill.status.draft',
    defaultMessage: '草稿',
  },
  statusChecking: {
    id: 'bss.bill.status.checking',
    defaultMessage: '待对账',
  },
  statusAccepted: {
    id: 'bss.bill.status.accepted',
    defaultMessage: '已接受',
  },
  statusOffline: {
    id: 'bss.bill.status.offline',
    defaultMessage: '线下账单',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
