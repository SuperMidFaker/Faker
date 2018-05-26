import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import moduleMessages from '../message.i18n';


const messages = defineMessages({
  addToServiceTeam: {
    id: 'sof.customer.addto.serviceteam',
    defaultMessage: '添加团队成员',
  },
  allMembers: {
    id: 'sof.customer.all.members',
    defaultMessage: '所有成员',
  },
});

export default messages;
export const formatMsg = formati18n({ ...globalMessages, ...moduleMessages, ...messages });
