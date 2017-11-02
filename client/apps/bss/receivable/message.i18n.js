import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  fee: {
    id: 'bss.receivable',
    defaultMessage: '应收',
  },
  feeSummary: {
    id: 'bss.receivable.bill',
    defaultMessage: '客户账单',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
