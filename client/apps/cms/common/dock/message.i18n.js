import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  client: {
    id: 'cms.dock.client',
    defaultMessage: '货主',
  },
  forwarder: {
    id: 'cms.dock.forwarder',
    defaultMessage: '货代',
  },
  broker: {
    id: 'cms.dock.broker',
    defaultMessage: '报关行',
  },
  revenue: {
    id: 'cms.dock.tabpanes.billing.revenue',
    defaultMessage: '收入',
  },
  cost: {
    id: 'cms.dock.tabpanes.billing.cost',
    defaultMessage: '成本',
  },
  revenueDetail: {
    id: 'cms.dock.tabpanes.billing.revenue.detail',
    defaultMessage: '收入明细',
  },
  costDetail: {
    id: 'cms.dock.tabpanes.billing.cost.detail',
    defaultMessage: '成本明细',
  },
  serviceFee: {
    id: 'cms.dock.tabpanes.service.fee',
    defaultMessage: '服务费',
  },
  cushionFee: {
    id: 'cms.dock.tabpanes.cushion.fee',
    defaultMessage: '代垫费',
  },
  feeName: {
    id: 'cms.dock.tabpanes.fee.name',
    defaultMessage: '费用名称',
  },
  feeRemark: {
    id: 'cms.dock.tabpanes.fee.remark',
    defaultMessage: '费用说明',
  },
  feeVal: {
    id: 'cms.dock.tabpanes.fee.val',
    defaultMessage: '金额',
  },
  taxFee: {
    id: 'cms.dock.tabpanes.tax.fee',
    defaultMessage: '税金',
  },
  totalFee: {
    id: 'cms.dock.tabpanes.total.fee',
    defaultMessage: '价税合计',
  },
  info: {
    id: 'cms.dock.tabpanes.expense,info',
    defaultMessage: '无匹配报价规则',
  },
  consginSource: {
    id: 'cms.dock.consign.source',
    defaultMessage: '委托',
  },
  subcontractSource: {
    id: 'cms.dock.subcontract.source',
    defaultMessage: '分包',
  },
  ciqDispMessage: {
    id: 'cms.dock.message.ciq.dispatch',
    defaultMessage: '请选择报检供应商',
  },
  dispatchMessage: {
    id: 'cms.dock.message.dispatch',
    defaultMessage: '请选择供应商',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
