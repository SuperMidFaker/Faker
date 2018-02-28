import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  quoteRates: {
    id: 'cms.quote.rates',
    defaultMessage: '报价费率',
  },
  filterAll: {
    id: 'cms.quote.filter.all',
    defaultMessage: '全部',
  },
  filterSelling: {
    id: 'cms.quote.filter.selling',
    defaultMessage: '销售价',
  },
  filterBuying: {
    id: 'cms.quote.filter.buying',
    defaultMessage: '成本价',
  },
  filterDraft: {
    id: 'cms.quote.filter.draft',
    defaultMessage: '草稿箱',
  },
  quoteNo: {
    id: 'cms.quote.quote_no',
    defaultMessage: '报价编号',
  },
  newQuote: {
    id: 'cms.quote.new_quote',
    defaultMessage: '新建报价',
  },
  editQuote: {
    id: 'cms.quote.edit_quote',
    defaultMessage: '修订报价',
  },
  tariffKinds: {
    id: 'cms.quote.tariff_kinds',
    defaultMessage: '报价类型',
  },
  partnerLabel: {
    id: 'cms.quote.partners',
    defaultMessage: '客户/供应商',
  },
  partnerPermission: {
    id: 'cms.quote.form.partner.permission',
    defaultMessage: '对方权限',
  },
  permissionView: {
    id: 'cms.quote.form.permission.view',
    defaultMessage: '查看',
  },
  permissionEdit: {
    id: 'cms.quote.form.permission.edit',
    defaultMessage: '修订',
  },
  transMode: {
    id: 'cms.quote.trans_mode',
    defaultMessage: '运输方式',
  },
  declareWay: {
    id: 'cms.quote.declare_way',
    defaultMessage: '清关类型',
  },
  invoiceType: {
    id: 'cms.quote.invoice_type',
    defaultMessage: '发票类型',
  },
  declItemQuantity: {
    id: 'cms.quote.form.decl.item.quantity',
    defaultMessage: '报关单品项数',
  },
  ciqItemQuantity: {
    id: 'cms.quote.form.ciq.item.quantity',
    defaultMessage: '报检单品项数',
  },
  serialNo: {
    id: 'cms.quote.serial_no',
    defaultMessage: '序号',
  },
  feeName: {
    id: 'cms.quote.fee_name',
    defaultMessage: '费用名称',
  },
  feeCode: {
    id: 'cms.quote.fee_code',
    defaultMessage: '费用代码',
  },
  feeCategory: {
    id: 'cms.quote.fee_category',
    defaultMessage: '费用分类',
  },
  feeStyle: {
    id: 'cms.quote.fee_style',
    defaultMessage: '费用类型',
  },
  chargeParam: {
    id: 'cms.quote.charge.param',
    defaultMessage: '计费参数',
  },
  formulaFactor: {
    id: 'cms.quote.formula.factor',
    defaultMessage: '单价/费率/公式',
  },
  unitPrice: {
    id: 'cms.quote.unit_price',
    defaultMessage: '单价',
  },
  modifiedCount: {
    id: 'cms.quote.modified_count',
    defaultMessage: '修订次数',
  },
  version: {
    id: 'cms.quote.version',
    defaultMessage: '当前版本',
  },
  modifiedBy: {
    id: 'cms.quote.modified_by',
    defaultMessage: '最后修订人',
  },
  modifiedTime: {
    id: 'cms.quote.modified_time',
    defaultMessage: '最后修订时间',
  },
  enabledOp: {
    id: 'cms.quote.enabledOp',
    defaultMessage: '是否启用',
  },
  operation: {
    id: 'cms.quote.operation',
    defaultMessage: '操作',
  },
  batchModify: {
    id: 'cms.quote.batchModify',
    defaultMessage: '批量修改',
  },
  batchSave: {
    id: 'cms.quote.batchSave',
    defaultMessage: '全部保存',
  },
  save: {
    id: 'cms.quote.save',
    defaultMessage: '保存',
  },
  copy: {
    id: 'cms.quote.copy',
    defaultMessage: '复制',
  },
  confirm: {
    id: 'cms.quote.confirm',
    defaultMessage: '确定',
  },
  cancel: {
    id: 'cms.quote.cancel',
    defaultMessage: '取消',
  },
  delete: {
    id: 'cms.quote.delete',
    defaultMessage: '删除',
  },
  addCosts: {
    id: 'cms.quote.add_costs',
    defaultMessage: '增加费用项',
  },
  requested: {
    id: 'cms.quote.requested',
    defaultMessage: '必选',
  },
  remark: {
    id: 'cms.quote.remark',
    defaultMessage: '加注标签',
  },
  invoiceEn: {
    id: 'cms.quote.invoiceEn',
    defaultMessage: '是否计税',
  },
  taxRate: {
    id: 'cms.quote.tax.rate',
    defaultMessage: '税率',
  },
  status: {
    id: 'cms.quote.status',
    defaultMessage: '状态',
  },
  modify: {
    id: 'cms.quote.modify',
    defaultMessage: '修改',
  },
  revise: {
    id: 'cms.quote.revise',
    defaultMessage: '修订',
  },
  reviseContinue: {
    id: 'cms.quote.revise.continue',
    defaultMessage: '继续修订',
  },
  view: {
    id: 'cms.quote.view',
    defaultMessage: '查看',
  },
  valid: {
    id: 'cms.quote.valid',
    defaultMessage: '有效',
  },
  invalid: {
    id: 'cms.quote.invalid',
    defaultMessage: '无效',
  },
  disable: {
    id: 'cms.quote.disable',
    defaultMessage: '禁用',
  },
  enable: {
    id: 'cms.quote.enable',
    defaultMessage: '启用',
  },
  publish: {
    id: 'cms.quote.publish',
    defaultMessage: '发布',
  },
  trial: {
    id: 'cms.quote.trial',
    defaultMessage: '试算',
  },
  more: {
    id: 'cms.quote.more',
    defaultMessage: '更多',
  },
  publishTitle: {
    id: 'cms.quote.modal.publish.title',
    defaultMessage: '报价发布',
  },
  basementDateType: {
    id: 'cms.quote.modal.basement.datetype',
    defaultMessage: '基准日期类型',
  },
  basementDate: {
    id: 'cms.quote.modal.basement.date',
    defaultMessage: '生效起始时间',
  },
  publishRemark: {
    id: 'cms.quote.modal.publish.remark',
    defaultMessage: '说明',
  },
  publishVersion: {
    id: 'cms.quote.revision.publish.version',
    defaultMessage: '版本',
  },
  publishDate: {
    id: 'cms.quote.revision.publish.date',
    defaultMessage: '发布日期',
  },
  publisher: {
    id: 'cms.quote.revision.publisher',
    defaultMessage: '发布人',
  },
  newVersion: {
    id: 'cms.quote.revision.new.version',
    defaultMessage: '新版本',
  },
  trialTitle: {
    id: 'cms.quote.modal.trial.title',
    defaultMessage: '试算报价',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
