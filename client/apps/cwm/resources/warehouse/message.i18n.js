import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  warehouse: {
    id: 'cwm.resources.warehouse',
    defaultMessage: '仓库',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
