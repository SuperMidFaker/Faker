import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  logs: {
    id: 'corp.logs',
    defaultMessage: '操作日志',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
