import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import moduleMessages from '../message.i18n';

const messages = defineMessages({
  profile: {
    id: 'sof.customers.profile',
    defaultMessage: '客户资料',
  },
  subCustomer: {
    id: 'sof.customers.sub.customer',
    defaultMessage: '子客户',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatModuleMsg = formati18n(moduleMessages);
