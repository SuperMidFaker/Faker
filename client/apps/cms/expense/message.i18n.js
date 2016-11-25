import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'cms.expense.search',
    defaultMessage: '委托编号/发票号/提运单号',
  },
  expense: {
    id: 'cms.expense.title',
    defaultMessage: '费用',
  },
  all: {
    id: 'cms.expense.all',
    defaultMessage: '全部',
  },
  nostatement: {
    id: 'cms.expense.nostatement',
    defaultMessage: '未结单',
  },
  statement: {
    id: 'cms.expense.statement',
    defaultMessage: '已结单',
  },
  invoiced: {
    id: 'cms.expense.invoiced',
    defaultMessage: '已开票',
  },
  incExp: {
    id: 'cms.expense.inc.expense',
    defaultMessage: '导入费用',
  },
  markState: {
    id: 'cms.expense.mark.statement',
    defaultMessage: '标记结单',
  },
  delgNo: {
    id: 'cms.expense.delgNo',
    defaultMessage: '委托编号',
  },
  custName: {
    id: 'cms.expense.customer.name',
    defaultMessage: '委托方',
  },
  invoiceNo: {
    id: 'cms.expense.invoice.no',
    defaultMessage: '发票号',
  },
  bLNo: {
    id: 'cms.expense.bill.lading.no',
    defaultMessage: '提运单号',
  },
  revenue: {
    id: 'cms.expense.revenue',
    defaultMessage: '收入',
  },
  serviceRevenue: {
    id: 'cms.expense.revenue.service',
    defaultMessage: '服务收入',
  },
  cushBill: {
    id: 'cms.expense.cushion.bill',
    defaultMessage: '代垫收入',
  },
  allBill: {
    id: 'cms.expense.all.bill',
    defaultMessage: '收入合计',
  },
  cost: {
    id: 'cms.expense.cost',
    defaultMessage: '成本',
  },
  servCost: {
    id: 'cms.expense.service.cost',
    defaultMessage: '服务成本',
  },
  cushCost: {
    id: 'cms.expense.cushion.cost',
    defaultMessage: '代垫成本',
  },
  allCost: {
    id: 'cms.expense.all.cost',
    defaultMessage: '成本合计',
  },
  statementEn: {
    id: 'cms.expense.statementEn',
    defaultMessage: '是否结单',
  },
  lastActT: {
    id: 'cms.expense.last.act.time',
    defaultMessage: '最后更新时间',
  },
  feeName: {
    id: 'cms.expense.modal.fee.name',
    defaultMessage: '费用名称',
  },
  feeVal: {
    id: 'cms.expense.modal.fee.value',
    defaultMessage: '金额',
  },
  currency: {
    id: 'cms.expense.modal.currency',
    defaultMessage: '币制',
  },
  remark: {
    id: 'cms.expense.modal.remark',
    defaultMessage: '备注',
  },
  custBroker: {
    id: 'cms.expense.modal.cust.broker',
    defaultMessage: '报关供应商',
  },
  ciqBroker: {
    id: 'cms.expense.modal.ciq.broker',
    defaultMessage: '报检供应商',
  },
  certBroker: {
    id: 'cms.expense.modal.cert.broker',
    defaultMessage: '办证供应商',
  },
  entryId: {
    id: 'cms.expense.delg.entryId',
    defaultMessage: '报关单号',
  },
  preEntryNo: {
    id: 'cms.expense.delg.preEntry.no',
    defaultMessage: '统一编号',
  },
  advanceFee: {
    id: 'cms.expense.delg.advance.fee',
    defaultMessage: '代垫费',
  },
  advanceParty: {
    id: 'cms.modals.expense.advance.party',
    defaultMessage: '代垫方',
  },
  advancePartyRequired: {
    id: 'cms.modals.expense.advance.party.required',
    defaultMessage: '代垫方必选',
  },
  advanceFeeRequired: {
    id: 'cms.modals.expense.advance.fee.required',
    defaultMessage: '金额必填',
  },
  advanceTaxType: {
    id: 'cms.modals.expense.advance.taxtype',
    defaultMessage: '开票',
  },
  advanceTaxTypeRequired: {
    id: 'cms.modals.expense.advance.taxtype.required',
    defaultMessage: '开票类型必选',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
