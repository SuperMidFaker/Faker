import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import moduleMessages from '../message.i18n';

const messages = defineMessages({
  addToServiceTeam: {
    id: 'sof.customer.addto.serviceteam',
    defaultMessage: '添加成员至服务团队',
  },
  allMembers: {
    id: 'sof.customer.all.members',
    defaultMessage: '所有成员',
  },
});

export default messages;
export const formatMsg = formati18n({ ...moduleMessages, ...messages });
