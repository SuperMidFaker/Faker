import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  revenue: {
    id: 'cms.modals.tabpanes.billing.revenue',
    defaultMessage: '收入',
  },
  cost: {
    id: 'cms.modals.tabpanes.billing.cost',
    defaultMessage: '成本',
  },
  revenueDetail: {
    id: 'cms.modals.tabpanes.billing.revenue.detail',
    defaultMessage: '收入明细',
  },
  costDetail: {
    id: 'cms.modals.tabpanes.billing.cost.detail',
    defaultMessage: '成本明细',
  },
  serviceFee: {
    id: 'cms.modals.tabpanes.service.fee',
    defaultMessage: '服务费',
  },
  cushionFee: {
    id: 'cms.modals.tabpanes.cushion.fee',
    defaultMessage: '代垫费',
  },
  feeName: {
    id: 'cms.modals.tabpanes.fee.name',
    defaultMessage: '费用名称',
  },
  feeRemark: {
    id: 'cms.modals.tabpanes.fee.remark',
    defaultMessage: '费用说明',
  },
  feeVal: {
    id: 'cms.modals.tabpanes.fee.val',
    defaultMessage: '金额',
  },
  taxFee: {
    id: 'cms.modals.tabpanes.tax.fee',
    defaultMessage: '税金',
  },
  totalFee: {
    id: 'cms.modals.tabpanes.total.fee',
    defaultMessage: '价税合计',
  },
  info: {
    id: 'cms.modals.tabpanes.expense,info',
    defaultMessage: '无匹配报价规则',
  },
  consginSource: {
    id: 'cms.modals.consign.source',
    defaultMessage: '委托',
  },
  subcontractSource: {
    id: 'cms.modals.subcontract.source',
    defaultMessage: '分包',
  },
  ciqDispMessage: {
    id: 'cms.delegation.message.ciq.dispatch',
    defaultMessage: '请选择报检供应商',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
