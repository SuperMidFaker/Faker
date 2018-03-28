import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  bill: {
    id: 'bss.bill',
    defaultMessage: '账单管理',
  },
  createBill: {
    id: 'bss.bill.create',
    defaultMessage: '新建账单',
  },
  buyerBill: {
    id: 'bss.bill.buyer.bill',
    defaultMessage: '客户账单',
  },
  sellerBill: {
    id: 'bss.bill.seller.bill',
    defaultMessage: '服务商账单',
  },
  offlineBill: {
    id: 'bss.bill.type.offline.bill',
    defaultMessage: '线下账单',
  },
  forwardProposedBill: {
    id: 'bss.bill.type.forward.proposed.bill',
    defaultMessage: '正向账单',
  },
  backwardProposedBill: {
    id: 'bss.bill.type.backward.proposed.bill',
    defaultMessage: '反向账单',
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
  statusReconciling: {
    id: 'bss.bill.status.reconciling',
    defaultMessage: '对账',
  },
  statusWriteOff: {
    id: 'bss.bill.status.write.off',
    defaultMessage: '核销',
  },
  writtenOffBills: {
    id: 'bss.bill.written.off',
    defaultMessage: '核销完成的账单',
  },
  searchTips: {
    id: 'bss.bill.search.tips',
    defaultMessage: '账单名称',
  },
  billTemplates: {
    id: 'bss.bill.templates',
    defaultMessage: '账单模板',
  },
  billStatementTemplateList: {
    id: 'bss.bill.staetment.template.list',
    defaultMessage: '账单模板',
  },
  newBillTemplate: {
    id: 'bss.bill.template.create',
    defaultMessage: '新建账单模板',
  },
  templateSearchTips: {
    id: 'bss.bill.search.tips',
    defaultMessage: '模板名称/结算对象名称',
  },
  feeName: {
    id: 'bss.bill.fee.name',
    defaultMessage: '费用名称',
  },
  feeCodes: {
    id: 'bss.bill.fee.codes',
    defaultMessage: '费用项',
  },
  billType: {
    id: 'bss.bill.type',
    defaultMessage: '账单类型',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
