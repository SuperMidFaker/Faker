import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  vendor: {
    id: 'sof.vendors.vendor',
    defaultMessage: '供应商',
  },
  add: {
    id: 'sof.vendors.add',
    defaultMessage: '新增',
  },
  save: {
    id: 'sof.vendors.save',
    defaultMessage: '保存',
  },
  searchPlaceholder: {
    id: 'sof.vendors.search.placeholder',
    defaultMessage: '搜索供应商',
  },
  vendorName: {
    id: 'sof.vendors.name',
    defaultMessage: '供应商名称',
  },
  vendorCode: {
    id: 'sof.vendors.code',
    defaultMessage: '供应商代码',
  },
  displayName: {
    id: 'sof.vendors.display.name',
    defaultMessage: '显示名称',
  },
  englishName: {
    id: 'sof.vendors.english.name',
    defaultMessage: '英文名称',
  },
  profile: {
    id: 'sof.vendors.profile',
    defaultMessage: '供应商资料',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
