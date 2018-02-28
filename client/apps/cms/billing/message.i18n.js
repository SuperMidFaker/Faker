import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'cms.billing.search',
    defaultMessage: '委托编号/提运单号',
  },
  payableExpense: {
    id: 'cms.billing.payable',
    defaultMessage: '应付费用',
  },
  receivableExpense: {
    id: 'cms.billing.receivable',
    defaultMessage: '应收费用',
  },
  statusBilling: {
    id: 'cms.billing.status.billing',
    defaultMessage: '计费中',
  },
  statusPending: {
    id: 'cms.billing.status.pending',
    defaultMessage: '待提交',
  },
  statusSubmitted: {
    id: 'cms.billing.status.submitted',
    defaultMessage: '已提交',
  },
  statusUnconfirmed: {
    id: 'cms.billing.status.unconfirmed',
    defaultMessage: '待确认',
  },
  statusConfirmed: {
    id: 'cms.billing.status.confirmed',
    defaultMessage: '已确认',
  },
  cusDeclCharges: {
    id: 'cms.billing.cus.decl.charges',
    defaultMessage: '报关收费',
  },
  ciqDeclCharges: {
    id: 'cms.billing.ciq.decl.charges',
    defaultMessage: '报检收费',
  },
  certsCharges: {
    id: 'cms.billing.certs.charges',
    defaultMessage: '鉴定办证收费',
  },
  cusDeclExpense: {
    id: 'cms.billing.cus.decl.expense',
    defaultMessage: '报关费用',
  },
  ciqDeclExpense: {
    id: 'cms.billing.ciq.decl.expense',
    defaultMessage: '报检费用',
  },
  certsExpense: {
    id: 'cms.billing.certs.expense',
    defaultMessage: '鉴定办证费用',
  },
  statusClosed: {
    id: 'cms.billing.status.closed',
    defaultMessage: '已关单',
  },
  statusSettled: {
    id: 'cms.billing.status.settled',
    defaultMessage: '已结算',
  },
  advModel: {
    id: 'cms.billing.advance.model',
    defaultMessage: '代垫费用模板',
  },
  eptAdvModel: {
    id: 'cms.billing.export.advance.model',
    defaultMessage: '下载代垫费用模板',
  },
  incExp: {
    id: 'cms.billing.inc.expense',
    defaultMessage: '上传代垫费用记录',
  },
  eptExp: {
    id: 'cms.billing.export.expense',
    defaultMessage: '导出',
  },
  chooseModel: {
    id: 'cms.billing.export.chooseModel',
    defaultMessage: '范围方式',
  },
  acptDate: {
    id: 'cms.billing.export.acptDate',
    defaultMessage: '接单日期',
  },
  cleanDate: {
    id: 'cms.billing.export.cleanDate',
    defaultMessage: '放行日期',
  },
  range: {
    id: 'cms.billing.export.range',
    defaultMessage: '费用周期',
  },
  status: {
    id: 'cms.billing.status',
    defaultMessage: '状态',
  },
  delgNo: {
    id: 'cms.billing.delgNo',
    defaultMessage: '委托编号',
  },
  custName: {
    id: 'cms.billing.customer.name',
    defaultMessage: '客户',
  },
  agentName: {
    id: 'cms.billing.agent.name',
    defaultMessage: '报关代理',
  },
  orderNo: {
    id: 'cms.billing.order.no',
    defaultMessage: '客户单号',
  },
  bLNo: {
    id: 'cms.billing.bill.lading.no',
    defaultMessage: '提运单号',
  },
  receivableTotal: {
    id: 'cms.billing.receivable.total',
    defaultMessage: '应收合计',
  },
  serviceSummary: {
    id: 'cms.billing.service.summary',
    defaultMessage: '服务费小计',
  },
  forwarderCharge: {
    id: 'cms.billing.forwarder.charge',
    defaultMessage: '换单费',
  },
  advanceSummary: {
    id: 'cms.billing.advance.summary',
    defaultMessage: '代垫费小计',
  },
  cushBill: {
    id: 'cms.billing.cushion.bill',
    defaultMessage: '代垫应收',
  },
  allBill: {
    id: 'cms.billing.all.bill',
    defaultMessage: '应收合计',
  },
  cost: {
    id: 'cms.billing.cost',
    defaultMessage: '应付',
  },
  serviceExpense: {
    id: 'cms.billing.service.expense',
    defaultMessage: '服务费用',
  },
  cushCost: {
    id: 'cms.billing.cushion.cost',
    defaultMessage: '代垫费用',
  },
  allCost: {
    id: 'cms.billing.all.cost',
    defaultMessage: '应付合计',
  },
  profit: {
    id: 'cms.billing.profit',
    defaultMessage: '盈亏',
  },
  statementEn: {
    id: 'cms.billing.statementEn',
    defaultMessage: '是否结单',
  },
  ccdCount: {
    id: 'cms.billing.ccd.count',
    defaultMessage: '拼单数',
  },
  ccsCount: {
    id: 'cms.billing.ccs.count',
    defaultMessage: '联单数',
  },
  itemCount: {
    id: 'cms.billing.item.count',
    defaultMessage: '品项数',
  },
  prdtCount: {
    id: 'cms.billing.prdt.count',
    defaultMessage: '料号数',
  },
  declValue: {
    id: 'cms.billing.decl.value',
    defaultMessage: '进出口金额',
  },
  acptTime: {
    id: 'cms.billing.accept.time',
    defaultMessage: '接单时间',
  },
  cleanTime: {
    id: 'cms.billing.clean.time',
    defaultMessage: '放行时间',
  },
  lastActT: {
    id: 'cms.billing.last.act.time',
    defaultMessage: '最后计费时间',
  },
  feeName: {
    id: 'cms.billing.fee.name',
    defaultMessage: '费用名称',
  },
  feeCategory: {
    id: 'cms.billing.fee.category',
    defaultMessage: '费用分组',
  },
  feeType: {
    id: 'cms.billing.fee.category',
    defaultMessage: '费用类型',
  },
  feeVal: {
    id: 'cms.billing.modal.fee.value',
    defaultMessage: '金额',
  },
  currency: {
    id: 'cms.billing.modal.currency',
    defaultMessage: '币制',
  },
  remark: {
    id: 'cms.billing.modal.remark',
    defaultMessage: '备注',
  },
  custBroker: {
    id: 'cms.billing.modal.cust.broker',
    defaultMessage: '报关供应商',
  },
  ciqBroker: {
    id: 'cms.billing.modal.ciq.broker',
    defaultMessage: '报检供应商',
  },
  certBroker: {
    id: 'cms.billing.modal.cert.broker',
    defaultMessage: '办证供应商',
  },
  entryId: {
    id: 'cms.billing.delg.entryId',
    defaultMessage: '报关单号',
  },
  billSeqNo: {
    id: 'cms.billing.delg.billSeq.no',
    defaultMessage: '清单编号',
  },
  preEntryNo: {
    id: 'cms.billing.delg.preEntry.no',
    defaultMessage: '统一编号',
  },
  advanceFee: {
    id: 'cms.billing.delg.advance.fee',
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
  expenseDetail: {
    id: 'cms.modals.expense.detail',
    defaultMessage: '费用明细',
  },
  rates: {
    id: 'cms.billing.rates',
    defaultMessage: '报价费率',
  },
  customerRates: {
    id: 'cms.billing.rates.customer',
    defaultMessage: '客户报价',
  },
  vendorRates: {
    id: 'cms.billing.rates.vendor',
    defaultMessage: '服务商报价',
  },
  billingParams: {
    id: 'cms.billing.rates.billing.params',
    defaultMessage: '计费参数',
  },
  billingMethod: {
    id: 'cms.billing.rates.billing.method',
    defaultMessage: '计费方式',
  },
  formulaFactor: {
    id: 'cms.billing.rates.formula.factor',
    defaultMessage: '单价/公式',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
