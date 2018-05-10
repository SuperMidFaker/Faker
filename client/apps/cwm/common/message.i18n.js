import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  selectWhse: {
    id: 'cwm.common.select.whse',
    defaultMessage: '选择仓库',
  },
  whseChanged: {
    id: 'cwm.common.whse.changed',
    defaultMessage: '当前仓库已切换',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
