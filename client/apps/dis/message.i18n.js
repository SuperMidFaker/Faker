import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'dis.module.dashboard',
    defaultMessage: '仪表盘',
  },
  report: {
    id: 'dis.module.report',
    defaultMessage: '报表',
  },
  bill: {
    id: 'dis.module.bill',
    defaultMessage: '账单管理',
  },
  invoice: {
    id: 'dis.module.invoice',
    defaultMessage: '发票管理',
  },
  voucher: {
    id: 'dis.module.voucher',
    defaultMessage: '凭证管理',
  },
  settings: {
    id: 'dis.module.settings',
    defaultMessage: '设置',
  },
  devApps: {
    id: 'dis.module.dev.apps',
    defaultMessage: '更多应用',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
