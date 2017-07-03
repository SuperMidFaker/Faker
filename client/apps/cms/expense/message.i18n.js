import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'cms.expense.search',
    defaultMessage: '委托编号/发票号/提运单号',
  },
  expense: {
    id: 'cms.expense.title',
    defaultMessage: '费用管理',
  },
  all: {
    id: 'cms.expense.all',
    defaultMessage: '全部',
  },
  statusPending: {
    id: 'cms.expense.status.pending',
    defaultMessage: '待计费',
  },
  statusEstimated: {
    id: 'cms.expense.status.estimated',
    defaultMessage: '已预估',
  },
  statusClosed: {
    id: 'cms.expense.status.closed',
    defaultMessage: '已结单',
  },
  incExp: {
    id: 'cms.expense.inc.expense',
    defaultMessage: '上传费用记录',
  },
  eptExp: {
    id: 'cms.expense.export.expense',
    defaultMessage: '导出',
  },
  chooseModel: {
    id: 'cms.expense.export.chooseModel',
    defaultMessage: '范围方式',
  },
  acptDate: {
    id: 'cms.expense.export.acptDate',
    defaultMessage: '接单日期',
  },
  cleanDate: {
    id: 'cms.expense.export.cleanDate',
    defaultMessage: '放行日期',
  },
  range: {
    id: 'cms.expense.export.range',
    defaultMessage: '费用周期',
  },
  status: {
    id: 'cms.expense.status',
    defaultMessage: '状态',
  },
  delgNo: {
    id: 'cms.expense.delgNo',
    defaultMessage: '委托编号',
  },
  custName: {
    id: 'cms.expense.customer.name',
    defaultMessage: '客户',
  },
  agentName: {
    id: 'cms.expense.agent.name',
    defaultMessage: '报关代理',
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
  profit: {
    id: 'cms.expense.profit',
    defaultMessage: '盈亏',
  },
  statementEn: {
    id: 'cms.expense.statementEn',
    defaultMessage: '是否结单',
  },
  acptTime: {
    id: 'cms.expense.accept.time',
    defaultMessage: '接单时间',
  },
  cleanTime: {
    id: 'cms.expense.clean.time',
    defaultMessage: '放行时间',
  },
  lastActT: {
    id: 'cms.expense.last.act.time',
    defaultMessage: '最后计费时间',
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
    defaultMessage: '预报关编号',
  },
  advanceFee: {
    id: 'cms.expense.delg.advance.fee',
    defaultMessage: '代垫费',
  },
  advanceParty: {
    id: 'cms.modals.expense.advance.party',
    defaultMessage: '代垫方',
  },
  taxValue: {
    id: 'cms.modals.expense.advance.tax.value',
    defaultMessage: '税金',
  },
  totalValue: {
    id: 'cms.modals.expense.advance.fee.total',
    defaultMessage: '总和',
  },
  advanceTaxType: {
    id: 'cms.modals.expense.advance.taxtype',
    defaultMessage: '开票抬头',
  },
  advanceTaxTypeRequired: {
    id: 'cms.modals.expense.advance.taxtype.required',
    defaultMessage: '开票类型必选',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
