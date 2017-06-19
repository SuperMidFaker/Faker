import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  invoice: {
    id: 'cms.document.component.invoice',
    defaultMessage: '发票',
  },
  contract: {
    id: 'cms.document.component.contract',
    defaultMessage: '合同',
  },
  industryCategory: {
    id: 'cms.document.component.industry.category',
    defaultMessage: '行业分类',
  },
  enGName: {
    id: 'cms.document.component.en.g.name',
    defaultMessage: '英文品名',
  },
  unitPrice: {
    id: 'cms.document.component.unit.price',
    defaultMessage: '单价',
  },
  subTotal: {
    id: 'cms.document.component.sub.total',
    defaultMessage: '小计',
  },
  insurance: {
    id: 'cms.document.component.insurance',
    defaultMessage: '保险',
  },
  destPort: {
    id: 'cms.document.component.destination.port',
    defaultMessage: '目的口岸',
  },
  remark: {
    id: 'cms.document.component.remark',
    defaultMessage: '备注',
  },
  sign: {
    id: 'cms.document.component.sign',
    defaultMessage: '签名栏',
  },
  save: {
    id: 'cms.document.component.save',
    defaultMessage: '保存',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
