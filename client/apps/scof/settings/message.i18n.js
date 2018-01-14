import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  settings: {
    id: 'scof.settings',
    defaultMessage: '设置',
  },
  cancel: {
    id: 'scof.settings.cancel',
    defaultMessage: '取消',
  },
  save: {
    id: 'scof.settings.save',
    defaultMessage: '保存',
  },
  modify: {
    id: 'scof.settings.modify',
    defaultMessage: '修改',
  },
  view: {
    id: 'scof.settings.view',
    defaultMessage: '查看',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
