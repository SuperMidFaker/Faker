import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  adaptorNotFound: {
    id: 'component.import.data.panel.adaptor.not.found',
    defaultMessage: '尚未配置数据适配器',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
