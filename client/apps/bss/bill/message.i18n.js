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
  pendingExpense: {
    id: 'bss.bill.pending.expense',
    defaultMessage: '未入账单的费用',
  },
  processingBills: {
    id: 'bss.bill.processing',
    defaultMessage: '结算中的账单',
  },
  billStatus: {
    id: 'bss.bill.status',
    defaultMessage: '账单状态',
  },
  statusDraft: {
    id: 'bss.bill.status.draft',
    defaultMessage: '草稿',
  },
  statusChecking: {
    id: 'bss.bill.status.checking',
    defaultMessage: '对账',
  },
  statusAccepted: {
    id: 'bss.bill.status.accepted',
    defaultMessage: '已接受',
  },
  settledBills: {
    id: 'bss.bill.settled',
    defaultMessage: '结算完成的账单',
  },
  searchTips: {
    id: 'bss.bill.search.tips',
    defaultMessage: '业务编号/客户编号',
  },
  billTemplate: {
    id: 'bss.bill.template',
    defaultMessage: '新建账单模板',
  },
  newBillTemplate: {
    id: 'bss.bill.template.create',
    defaultMessage: '新建账单模板',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
