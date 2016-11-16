import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
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
  advanceParty: {
    id: 'cms.modals.expense.advance.party',
    defaultMessage: '代垫方',
  },
  advancePartyRequired: {
    id: 'cms.modals.expense.advance.party.required',
    defaultMessage: '代垫方必选',
  },
  advanceFee: {
    id: 'cms.modals.expense.advance.fee',
    defaultMessage: '金额',
  },
  advanceFeeRequired: {
    id: 'cms.modals.expense.advance.fee.required',
    defaultMessage: '金额必填',
  },
  advanceCurrency: {
    id: 'cms.modals.expense.advance.currency',
    defaultMessage: '币制',
  },
  advanceTaxType: {
    id: 'cms.modals.expense.advance.taxtype',
    defaultMessage: '开票',
  },
  advanceTaxTypeRequired: {
    id: 'cms.modals.expense.advance.taxtype.required',
    defaultMessage: '开票类型必选',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
