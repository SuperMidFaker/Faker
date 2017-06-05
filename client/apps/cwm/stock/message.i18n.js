import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  stock: {
    id: 'cwm.stock',
    defaultMessage: '库存管理',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
