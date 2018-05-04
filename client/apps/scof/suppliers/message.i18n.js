import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  vendor: {
    id: 'sof.suppliers.vendor',
    defaultMessage: '供应商',
  },
  add: {
    id: 'sof.suppliers.add',
    defaultMessage: '新增',
  },
  save: {
    id: 'sof.suppliers.save',
    defaultMessage: '保存',
  },
  searchPlaceholder: {
    id: 'sof.suppliers.search.placeholder',
    defaultMessage: '搜索供应商',
  },
  vendorName: {
    id: 'sof.suppliers.name',
    defaultMessage: '供应商名称',
  },
  vendorCode: {
    id: 'sof.suppliers.code',
    defaultMessage: '供应商代码',
  },
  displayName: {
    id: 'sof.suppliers.display.name',
    defaultMessage: '显示名称',
  },
  englishName: {
    id: 'sof.suppliers.english.name',
    defaultMessage: '英文名称',
  },
  profile: {
    id: 'sof.suppliers.profile',
    defaultMessage: '供应商资料',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
