import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'bss.module.dashboard',
    defaultMessage: '工作台',
  },
  audit: {
    id: 'bss.module.audit',
    defaultMessage: '费用审核',
  },
  bill: {
    id: 'bss.module.bill',
    defaultMessage: '账单管理',
  },
  invoice: {
    id: 'bss.module.invoice',
    defaultMessage: '发票管理',
  },
  voucher: {
    id: 'bss.module.voucher',
    defaultMessage: '凭证管理',
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
