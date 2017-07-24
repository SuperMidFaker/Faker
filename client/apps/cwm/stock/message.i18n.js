import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  stock: {
    id: 'cwm.stock',
    defaultMessage: '库存',
  },
  query: {
    id: 'cwm.stock.query',
    defaultMessage: '库存查询',
  },
  movement: {
    id: 'cwm.stock.movement',
    defaultMessage: '库存移动',
  },
  createMovement: {
    id: 'cwm.stock.movement.create',
    defaultMessage: '创建库存移动单',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
