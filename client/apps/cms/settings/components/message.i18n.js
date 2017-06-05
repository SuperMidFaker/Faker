import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  invoice: {
    id: 'cms.invoice.component.invoice',
    defaultMessage: '发票',
  },
  industryCategory: {
    id: 'cms.invoice.component.industry.category',
    defaultMessage: '行业分类',
  },
  enGName: {
    id: 'cms.invoice.component.en.g.name',
    defaultMessage: '英文品名',
  },
  unitPrice: {
    id: 'cms.invoice.component.unit.price',
    defaultMessage: '单价',
  },
  subTotal: {
    id: 'cms.invoice.component.sub.total',
    defaultMessage: '小计',
  },
  insurance: {
    id: 'cms.invoice.component.insurance',
    defaultMessage: '保险',
  },
  destPort: {
    id: 'cms.invoice.component.destination.port',
    defaultMessage: '目的口岸',
  },
  remark: {
    id: 'cms.invoice.component.remark',
    defaultMessage: '备注',
  },
  save: {
    id: 'cms.invoice.component.save',
    defaultMessage: '保存',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
