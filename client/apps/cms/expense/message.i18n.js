import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'cms.expense.search',
    defaultMessage: '委托编号/发票号/提运单号',
  },
  billing: {
    id: 'cms.expense.billing',
    defaultMessage: '账务中心',
  },
  expense: {
    id: 'cms.expense',
    defaultMessage: '费用管理',
  },
  both: {
    id: 'cms.expense.both',
    defaultMessage: '收入/支出结算',
  },
  receivable: {
    id: 'cms.expense.receivable',
    defaultMessage: '收入结算',
  },
  payable: {
    id: 'cms.expense.payable',
    defaultMessage: '支出结算',
  },
  allStatus: {
    id: 'cms.expense.all.status',
    defaultMessage: '全部状态',
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
    defaultMessage: '已关单',
  },
  statusSettled: {
    id: 'cms.expense.status.settled',
    defaultMessage: '已结算',
  },
  advModel: {
    id: 'cms.expense.advance.model',
    defaultMessage: '代垫费用模板',
  },
  eptAdvModel: {
    id: 'cms.expense.export.advance.model',
    defaultMessage: '下载代垫费用模板',
  },
  incExp: {
    id: 'cms.expense.inc.expense',
    defaultMessage: '上传代垫费用记录',
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
  orderNo: {
    id: 'cms.expense.order.no',
    defaultMessage: '订单号',
  },
  bLNo: {
    id: 'cms.expense.bill.lading.no',
    defaultMessage: '提运单号',
  },
  revenue: {
    id: 'cms.expense.revenue',
    defaultMessage: '应收',
  },
  serviceRevenue: {
    id: 'cms.expense.revenue.service',
    defaultMessage: '服务应收',
  },
  cushBill: {
    id: 'cms.expense.cushion.bill',
    defaultMessage: '代垫应收',
  },
  allBill: {
    id: 'cms.expense.all.bill',
    defaultMessage: '应收合计',
  },
  cost: {
    id: 'cms.expense.cost',
    defaultMessage: '应付',
  },
  servCost: {
    id: 'cms.expense.service.cost',
    defaultMessage: '服务应付',
  },
  cushCost: {
    id: 'cms.expense.cushion.cost',
    defaultMessage: '代垫应付',
  },
  allCost: {
    id: 'cms.expense.all.cost',
    defaultMessage: '应付合计',
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
  billSeqNo: {
    id: 'cms.expense.delg.billSeq.no',
    defaultMessage: '清单编号',
  },
  preEntryNo: {
    id: 'cms.expense.delg.preEntry.no',
    defaultMessage: '内部编号',
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
  feeCode: {
    id: 'cms.modals.expense.fee.code',
    defaultMessage: '费用代码',
  },
  invoiceEn: {
    id: 'cms.modals.expense.invoiceEn',
    defaultMessage: '是否计税',
  },
  recipient: {
    id: 'cms.modals.expense.recipient',
    defaultMessage: '收款方',
  },
  payer: {
    id: 'cms.modals.expense.payer',
    defaultMessage: '付款方',
  },
  importMode: {
    id: 'cms.modals.expense.import.mode',
    defaultMessage: '导入类型',
  },
  opColumn: {
    id: 'cms.modals.expense.operation',
    defaultMessage: '操作',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
