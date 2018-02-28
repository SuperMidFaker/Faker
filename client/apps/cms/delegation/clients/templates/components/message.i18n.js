import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  invoice: {
    id: 'cms.document.component.invoice',
    defaultMessage: '发票模板',
  },
  contract: {
    id: 'cms.document.component.contract',
    defaultMessage: '合同模板',
  },
  packingList: {
    id: 'cms.document.component.packinglist',
    defaultMessage: '箱单模板',
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
  packages: {
    id: 'cms.document.component.packages',
    defaultMessage: '件数',
  },
  grossWt: {
    id: 'cms.document.component.gross.weight',
    defaultMessage: '毛重',
  },
  remark: {
    id: 'cms.document.component.remark',
    defaultMessage: '备注',
  },
  sign: {
    id: 'cms.document.component.sign',
    defaultMessage: '签名栏',
  },
  containerNo: {
    id: 'cms.document.component.container.no',
    defaultMessage: '箱号',
  },
  save: {
    id: 'cms.document.component.save',
    defaultMessage: '保存',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
