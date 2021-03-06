import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  audit: {
    id: 'bss.audit',
    defaultMessage: '费用审核',
  },
  statusSubmitted: {
    id: 'bss.audit.status.submitted',
    defaultMessage: '待审核',
  },
  statusWarning: {
    id: 'bss.audit.status.warning',
    defaultMessage: '异常费用',
  },
  statusConfirmed: {
    id: 'bss.audit.status.confirmed',
    defaultMessage: '已确认',
  },
  confirmAll: {
    id: 'bss.audit.confirm.all',
    defaultMessage: '一键确认',
  },
  searchTips: {
    id: 'bss.audit.search.tips',
    defaultMessage: '业务编号/客户编号',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
