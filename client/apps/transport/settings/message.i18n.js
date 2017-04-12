import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  appSettings: {
    id: 'transport.setting.appSettings',
    defaultMessage: '应用设置',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
