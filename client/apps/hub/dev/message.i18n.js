import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dev: {
    id: 'hub.dev',
    defaultMessage: '自建应用',
  },
  config: {
    id: 'hub.dev.config',
    defaultMessage: '配置',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
