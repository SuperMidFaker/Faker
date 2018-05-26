import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import moduleMessages from 'client/apps/cms/delegation/message.i18n';

const messages = defineMessages({
  delegation: {
    id: 'component.dock.delegation',
    defaultMessage: '报关委托',
  },
  client: {
    id: 'component.dock.client',
    defaultMessage: '货主',
  },
  forwarder: {
    id: 'component.dock.forwarder',
    defaultMessage: '货代',
  },
  broker: {
    id: 'component.dock.broker',
    defaultMessage: '报关行',
  },
  revenue: {
    id: 'component.dock.tabpanes.billing.revenue',
    defaultMessage: '收入',
  },
  cost: {
    id: 'component.dock.tabpanes.billing.cost',
    defaultMessage: '成本',
  },
  revenueDetail: {
    id: 'component.dock.tabpanes.billing.revenue.detail',
    defaultMessage: '收入明细',
  },
  costDetail: {
    id: 'component.dock.tabpanes.billing.cost.detail',
    defaultMessage: '成本明细',
  },
  serviceFee: {
    id: 'component.dock.tabpanes.service.fee',
    defaultMessage: '服务费',
  },
  cushionFee: {
    id: 'component.dock.tabpanes.cushion.fee',
    defaultMessage: '代垫费',
  },
  feeName: {
    id: 'component.dock.tabpanes.fee.name',
    defaultMessage: '费用名称',
  },
  feeRemark: {
    id: 'component.dock.tabpanes.fee.remark',
    defaultMessage: '费用说明',
  },
  feeVal: {
    id: 'component.dock.tabpanes.fee.val',
    defaultMessage: '金额',
  },
  taxFee: {
    id: 'component.dock.tabpanes.tax.fee',
    defaultMessage: '税金',
  },
  totalFee: {
    id: 'component.dock.tabpanes.total.fee',
    defaultMessage: '价税合计',
  },
  info: {
    id: 'component.dock.tabpanes.expense,info',
    defaultMessage: '无匹配报价规则',
  },
  consginSource: {
    id: 'component.dock.consign.source',
    defaultMessage: '委托',
  },
  subcontractSource: {
    id: 'component.dock.subcontract.source',
    defaultMessage: '分包',
  },
  ciqDispMessage: {
    id: 'component.dock.message.ciq.dispatch',
    defaultMessage: '请选择报检供应商',
  },
  dispatchMessage: {
    id: 'component.dock.message.dispatch',
    defaultMessage: '请选择供应商',
  },
});

export default messages;
export const formatMsg = formati18n({ ...globalMessages, ...moduleMessages, ...messages });
