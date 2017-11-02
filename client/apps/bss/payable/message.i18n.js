import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  fee: {
    id: 'bss.payable',
    defaultMessage: '应收',
  },
  feeSummary: {
    id: 'bss.payable.bill',
    defaultMessage: '供应商账单',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
