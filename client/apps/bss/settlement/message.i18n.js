import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  fee: {
    id: 'bss.fee',
    defaultMessage: '费用',
  },
  feeSummary: {
    id: 'bss.fee.summary',
    defaultMessage: '费用汇总',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
