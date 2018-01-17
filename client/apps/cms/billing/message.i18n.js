import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  billing: {
    id: 'cms.billing',
    defaultMessage: '账务中心',
  },
  bills: {
    id: 'cms.billing.bills',
    defaultMessage: '账单',
  },
  receivable: {
    id: 'cms.billing.receivable',
    defaultMessage: '应收',
  },
  payable: {
    id: 'cms.billing.payable',
    defaultMessage: '应付',
  },
  createBilling: {
    id: 'cms.billing.create.bill',
    defaultMessage: '创建账单',
  },
  nextStep: {
    id: 'cms.billing.nextStep',
    defaultMessage: '下一步',
  },
  billingName: {
    id: 'cms.billing.billingName',
    defaultMessage: '账单名称',
  },
  startDate: {
    id: 'cms.billing.startDate',
    defaultMessage: '开始日期',
  },
  endDate: {
    id: 'cms.billing.endDate',
    defaultMessage: '结束日期',
  },
  servCharge: {
    id: 'cms.billing.servCharge',
    defaultMessage: '服务费用',
  },
  advanceCharge: {
    id: 'cms.billing.advanceCharge',
    defaultMessage: '代垫费用',
  },
  adjustCharge: {
    id: 'cms.billing.adjustCharge',
    defaultMessage: '调整费用',
  },
  finalCharge: {
    id: 'cms.billing.finalCharge',
    defaultMessage: '最终费用',
  },
  totalCharge: {
    id: 'cms.billing.totalCharge',
    defaultMessage: '账单总金额',
  },
  billingStatus: {
    id: 'cms.billing.billingStatus',
    defaultMessage: '是否入账',
  },
  delgNo: {
    id: 'cms.billing.delgNo',
    defaultMessage: '委托编号',
  },
  invoiceNo: {
    id: 'cms.billing.invoiceNo',
    defaultMessage: '发票号',
  },
  invoiced: {
    id: 'cms.billing.invoiced',
    defaultMessage: '开票',
  },
  save: {
    id: 'cms.billing.save',
    defaultMessage: '保存',
  },
  acptDate: {
    id: 'cms.billing.form.acptDate',
    defaultMessage: '接单日期',
  },
  cleanDate: {
    id: 'cms.billing.form.cleanDate',
    defaultMessage: '海关放行日期',
  },
  namePlaceholder: {
    id: 'cms.billing.form.name.placeholder',
    defaultMessage: '请输入账单名称',
  },
  chooseModel: {
    id: 'cms.billing.form.chooseModel',
    defaultMessage: '范围方式',
  },
  chooseModelPlaceholder: {
    id: 'cms.billing.form.chooseModel.placeholder',
    defaultMessage: '请选择范围方式',
  },
  rangePlaceholder: {
    id: 'cms.billing.form.range.placeholder',
    defaultMessage: '请选择账单周期',
  },
  partner: {
    id: 'cms.billing.form.partner',
    defaultMessage: '合作伙伴',
  },
  partnerPlaceholder: {
    id: 'cms.billing.form.partner.placeholder',
    defaultMessage: '请选择合作伙伴',
  },
  range: {
    id: 'cms.billing.form.range',
    defaultMessage: '账单周期',
  },
  checkBilling: {
    id: 'cms.billing.check',
    defaultMessage: '对账',
  },
  send: {
    id: 'cms.billing.send',
    defaultMessage: '发送',
  },
  edit: {
    id: 'cms.billing.edit',
    defaultMessage: '修改',
  },
  view: {
    id: 'cms.billin.view',
    defaultMessage: '查看',
  },
  status: {
    id: 'cms.billing.status',
    defaultMessage: '账单状态',
  },
  editBilling: {
    id: 'cms.billing.editbilling',
    defaultMessage: '修改账单',
  },
  viewBilling: {
    id: 'cms.billin.viewbilling',
    defaultMessage: '查看账单',
  },
  accept: {
    id: 'cms.billing.accept',
    defaultMessage: '接受',
  },
  export: {
    id: 'cms.billing.export',
    defaultMessage: '导出',
  },
  fee: {
    id: 'cms.billing.fee',
    defaultMessage: '费用',
  },
  lastUpdate: {
    id: 'cms.billing.last.update',
    defaultMessage: '上一次更新',
  },
  lastUpdateTime: {
    id: 'cms.billing.last.updateTime',
    defaultMessage: '更新时间',
  },
  chargeOff: {
    id: 'cms.billing.chargeoff',
    defaultMessage: '核销',
  },
  cancelCharge: {
    id: 'cms.billing.cancelCharge',
    defaultMessage: '核销金额',
  },
  cancelPlaceholder: {
    id: 'cms.billing.cancel.placeholder',
    defaultMessage: '请输入核销金额',
  },
  unit: {
    id: 'cms.billing.unit',
    defaultMessage: '元',
  },
  operation: {
    id: 'cms.billing.operation',
    defaultMessage: '操作',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
