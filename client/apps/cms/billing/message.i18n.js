import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'cms.billing.search',
    defaultMessage: '委托编号/提运单号/客户单号/报关单号',
  },
  payableExpense: {
    id: 'cms.billing.payable',
    defaultMessage: '应付费用',
  },
  receivableExpense: {
    id: 'cms.billing.receivable',
    defaultMessage: '应收费用',
  },
  allReceivable: {
    id: 'cms.billing.all.receivable',
    defaultMessage: '全部应收',
  },
  allPayable: {
    id: 'cms.billing.all.payable',
    defaultMessage: '全部应付',
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
    defaultMessage: '待审核',
  },
  statusConfirmed: {
    id: 'cms.billing.status.confirmed',
    defaultMessage: '已确认',
  },
  advModel: {
    id: 'cms.billing.advance.model',
    defaultMessage: '代垫费用模板',
  },
  eptAdvModel: {
    id: 'cms.billing.export.advance.model',
    defaultMessage: '下载代垫费用模板',
  },
  importFees: {
    id: 'cms.billing.import.fees',
    defaultMessage: '导入费用',
  },
  submitAll: {
    id: 'cms.billing.submit.all',
    defaultMessage: '一键提交',
  },
  confirmAll: {
    id: 'cms.billing.confirm.all',
    defaultMessage: '一键确认',
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
  bizStatus: {
    id: 'cms.billing.biz.status',
    defaultMessage: '业务状态',
  },
  delgNo: {
    id: 'cms.billing.delgNo',
    defaultMessage: '委托编号',
  },
  client: {
    id: 'cms.billing.client',
    defaultMessage: '客户',
  },
  provider: {
    id: 'cms.billing.provider',
    defaultMessage: '服务商',
  },
  buyerName: {
    id: 'cms.billing.buyer.name',
    defaultMessage: '委托方名称',
  },
  sellerName: {
    id: 'cms.billing.seller.name',
    defaultMessage: '服务商名称',
  },
  custOrderNo: {
    id: 'cms.billing.cust.order.no',
    defaultMessage: '客户单号',
  },
  waybillLadingNo: {
    id: 'cms.billing.bill.lading.no',
    defaultMessage: '提运单号',
  },
  serviceSummary: {
    id: 'cms.billing.service.summary',
    defaultMessage: '服务费小计',
  },
  advanceSummary: {
    id: 'cms.billing.advance.summary',
    defaultMessage: '代垫费小计',
  },
  spcSummary: {
    id: 'cms.billing.spc.summary',
    defaultMessage: '特殊费用',
  },
  receivableTotal: {
    id: 'cms.billing.receivable.total',
    defaultMessage: '应收合计',
  },
  payableTotal: {
    id: 'cms.billing.payable.total',
    defaultMessage: '应付合计',
  },
  expStatus: {
    id: 'cms.billing.expense.status',
    defaultMessage: '费用状态',
  },
  quoteNo: {
    id: 'cms.billing.quote.no',
    defaultMessage: '报价编号',
  },
  declQty: {
    id: 'cms.billing.decl.qty',
    defaultMessage: '拼单数',
  },
  declSheetQty: {
    id: 'cms.billing.decl.sheet.qty',
    defaultMessage: '联单数',
  },
  declItemQty: {
    id: 'cms.billing.decl.item.qty',
    defaultMessage: '品项数',
  },
  tradeItemQty: {
    id: 'cms.billing.trade.item.qty',
    defaultMessage: '料号数',
  },
  tradeAmount: {
    id: 'cms.billing.trade.amount',
    defaultMessage: '进出口金额',
  },
  acceptedDate: {
    id: 'cms.billing.accepted.date',
    defaultMessage: '接单日期',
  },
  releasedDate: {
    id: 'cms.billing.released.date',
    defaultMessage: '放行日期',
  },
  lastActT: {
    id: 'cms.billing.last.act.time',
    defaultMessage: '最后计费时间',
  },
  feeName: {
    id: 'cms.billing.fee.name',
    defaultMessage: '费用名称',
  },
  feeGroup: {
    id: 'cms.billing.fee.group',
    defaultMessage: '费用分组',
  },
  feeType: {
    id: 'cms.billing.fee.type',
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
  cusDeclNo: {
    id: 'cms.billing.cus.decl.no',
    defaultMessage: '报关单号',
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
  baseAmount: {
    id: 'cms.billing.expense.fee.baseAmount',
    defaultMessage: '人民币金额',
  },
  origAmount: {
    id: 'cms.billing.expense.fee.origAmount',
    defaultMessage: '金额',
  },
  origCurrency: {
    id: 'cms.billing.expense.fee.origCurrency',
    defaultMessage: '币制',
  },
  exchangeRate: {
    id: 'cms.billing.expense.fee.exchangeRate',
    defaultMessage: '汇率',
  },
  inputQty: {
    id: 'cms.billing.expense.fee.inputQty',
    defaultMessage: '数量',
  },
  invoiceEn: {
    id: 'cms.modals.expense.invoiceEn',
    defaultMessage: '是否计税',
  },
  taxRate: {
    id: 'cms.modals.tax.rate',
    defaultMessage: '税率',
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
  createQuote: {
    id: 'cms.billing.quote.create',
    defaultMessage: '新建报价',
  },
  quote: {
    id: 'cms.billing.quote',
    defaultMessage: '报价费率',
  },
  quoteType: {
    id: 'cms.billing.quote.type',
    defaultMessage: '报价类型',
  },
  clientQuote: {
    id: 'cms.billing.quote.client',
    defaultMessage: '委托方报价',
  },
  providerQuote: {
    id: 'cms.billing.quote.vendor',
    defaultMessage: '服务商报价',
  },
  quoteName: {
    id: 'cms.billing.quote.name',
    defaultMessage: '报价名称',
  },
  billingParams: {
    id: 'cms.billing.quote.params',
    defaultMessage: '计费参数',
  },
  billingWay: {
    id: 'cms.billing.quote.billing.way',
    defaultMessage: '计费方式',
  },
  billingStaff: {
    id: 'cms.billing.quote.billing.staff',
    defaultMessage: '计费人员',
  },
  confirmStaff: {
    id: 'cms.billing.quote.confirm.staff',
    defaultMessage: '审核人员',
  },
  formulaFactor: {
    id: 'cms.billing.quote.formula.factor',
    defaultMessage: '单价/公式',
  },
  settle: {
    id: 'cms.billing.quote.settle',
    defaultMessage: '是否结算',
  },
  newSpecialFee: {
    id: 'cms.billing.spe.new',
    defaultMessage: '新建特殊费用',
  },
  speName: {
    id: 'cms.billing.spe.name',
    defaultMessage: '特殊费用名称',
  },
  minAmount: {
    id: 'cms.billing.quotefee.minamout',
    defaultMessage: '最低金额',
  },
  maxAmount: {
    id: 'cms.billing.quotefee.maxamout',
    defaultMessage: '最高金额',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
