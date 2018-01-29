import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboardTitle: {
    id: 'scof.dashboard',
    defaultMessage: '工作台',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
