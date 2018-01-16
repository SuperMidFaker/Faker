import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  settings: {
    id: 'hub.settings',
    defaultMessage: '设置',
  },
  cancel: {
    id: 'hub.settings.cancel',
    defaultMessage: '取消',
  },
  save: {
    id: 'hub.settings.save',
    defaultMessage: '保存',
  },
  modify: {
    id: 'hub.settings.modify',
    defaultMessage: '修改',
  },
  config: {
    id: 'hub.settings.config',
    defaultMessage: '配置',
  },
  orderConfig: {
    id: 'hub.settings.order.config',
    defaultMessage: '订单类型配置',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
