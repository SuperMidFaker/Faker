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
  charCount: {
    id: 'cms.modals.tabpanes.charge.count',
    defaultMessage: '计费数量',
  },
  unitPrice: {
    id: 'cms.modals.tabpanes.unit.price',
    defaultMessage: '计费单价',
  },
  feeVal: {
    id: 'cms.modals.tabpanes.fee.val',
    defaultMessage: '费用金额',
  },
  taxFee: {
    id: 'cms.modals.tabpanes.tax.fee',
    defaultMessage: '税金',
  },
  totalFee: {
    id: 'cms.modals.tabpanes.total.fee',
    defaultMessage: '应收金额',
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
});

export default messages;

export const formatMsg = formati18n(messages);
