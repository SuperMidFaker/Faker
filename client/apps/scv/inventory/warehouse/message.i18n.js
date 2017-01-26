import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inventoryWarehouse: {
    id: 'scv.inventory.warehouse',
    defaultMessage: '仓库设置',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
