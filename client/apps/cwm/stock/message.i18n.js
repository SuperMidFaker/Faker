import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inventory: {
    id: 'cwm.stock.inventory',
    defaultMessage: '库存余量',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
