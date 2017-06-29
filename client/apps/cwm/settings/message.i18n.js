import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  settings: {
    id: 'cwm.settings',
    defaultMessage: '设置',
  },
  rules: {
    id: 'cwm.settings.rules',
    defaultMessage: '业务规则',
  },
  templates: {
    id: 'cwm.settings.templates',
    defaultMessage: '单据模板',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
