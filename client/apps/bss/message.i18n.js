import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'bss.module.dashboard',
    defaultMessage: '工作台',
  },
  settlement: {
    id: 'bss.module.settlement',
    defaultMessage: '费用结算',
  },
  bills: {
    id: 'bss.module.bills',
    defaultMessage: '账单管理',
  },
  settings: {
    id: 'bss.module.settings',
    defaultMessage: '设置',
  },
  devApps: {
    id: 'bss.module.dev.apps',
    defaultMessage: '更多应用',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
