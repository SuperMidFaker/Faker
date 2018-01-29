import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'cms.expense.search',
    defaultMessage: '委托编号/提运单号',
  },
  payableExpense: {
    id: 'cms.expense.payable',
    defaultMessage: '应付费用',
  },
  receivableExpense: {
    id: 'cms.expense.receivable',
    defaultMessage: '应收费用',
  },
  byDelegation: {
    id: 'cms.expense.by.delegation',
    defaultMessage: '按委托汇总',
  },
  byCustomer: {
    id: 'cms.expense.by.customer',
    defaultMessage: '按客户汇总',
  },
  byVendor: {
    id: 'cms.expense.by.vendor',
    defaultMessage: '按供应商汇总',
  },
  byItem: {
    id: 'cms.expense.by.item',
    defaultMessage: '按商品分摊',
  },
  cusDeclCharges: {
    id: 'cms.expense.cus.decl.charges',
    defaultMessage: '报关收费',
  },
  ciqDeclCharges: {
    id: 'cms.expense.ciq.decl.charges',
    defaultMessage: '报检收费',
  },
  certsCharges: {
    id: 'cms.expense.certs.charges',
    defaultMessage: '鉴定办证收费',
  },
  cusDeclExpense: {
    id: 'cms.expense.cus.decl.expense',
    defaultMessage: '报关费用',
  },
  ciqDeclExpense: {
    id: 'cms.expense.ciq.decl.expense',
    defaultMessage: '报检费用',
  },
  certsExpense: {
    id: 'cms.expense.certs.expense',
    defaultMessage: '鉴定办证费用',
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
    defaultMessage: '客户单号',
  },
  bLNo: {
    id: 'cms.expense.bill.lading.no',
    defaultMessage: '提运单号',
  },
  revenue: {
    id: 'cms.expense.revenue',
    defaultMessage: '应收',
  },
  serviceCharges: {
    id: 'cms.expense.service.charges',
    defaultMessage: '服务收费',
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
  serviceExpense: {
    id: 'cms.expense.service.expense',
    defaultMessage: '服务费用',
  },
  cushCost: {
    id: 'cms.expense.cushion.cost',
    defaultMessage: '代垫费用',
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
  ccdCount: {
    id: 'cms.expense.ccd.count',
    defaultMessage: '报关单数量',
  },
  ccsCount: {
    id: 'cms.expense.ccs.count',
    defaultMessage: '报关单联数',
  },
  itemCount: {
    id: 'cms.expense.item.count',
    defaultMessage: '品项数',
  },
  prdtCount: {
    id: 'cms.expense.prdt.count',
    defaultMessage: '料号数',
  },
  declValue: {
    id: 'cms.expense.decl.value',
    defaultMessage: '申报货值',
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
export const formatGlobalMsg = formati18n(globalMessages);
