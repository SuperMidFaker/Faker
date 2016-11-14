import { defineMessages } from 'react-intl';

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
  servBill: {
    id: 'cms.expense.service.bill',
    defaultMessage: '服务收费',
  },
  cushBill: {
    id: 'cms.expense.cushion.bill',
    defaultMessage: '代垫收款',
  },
  allBill: {
    id: 'cms.expense.all.bill',
    defaultMessage: '收款合计',
  },
  servCost: {
    id: 'cms.expense.service.cost',
    defaultMessage: '服务成本',
  },
  cushCost: {
    id: 'cms.expense.cushion.cost',
    defaultMessage: '代垫付款',
  },
  allCost: {
    id: 'cms.expense.all.cost',
    defaultMessage: '付款合计',
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
  entryId: {
    id: 'cms.expense.delg.entryId',
    defaultMessage: '报关单号',
  },
  preEntryNo: {
    id: 'cms.expense.delg.preEntry.no',
    defaultMessage: '统一编号',
  },
});
export default messages;
