import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  flow: {
    id: 'scop.flow',
    defaultMessage: '流程',
  },
  add: {
    id: 'scop.flow.add',
    defaultMessage: '添加',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
