import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import moduleMessages from 'client/apps/scof/partner/message.i18n';


const messages = defineMessages({
  customer: {
    id: 'component.dock.customer',
    defaultMessage: '客户',
  },
  addToServiceTeam: {
    id: 'component.dock.customer.addto.serviceteam',
    defaultMessage: '添加团队成员',
  },
  allMembers: {
    id: 'component.dock.customer.all.members',
    defaultMessage: '所有成员',
  },
});

export default messages;
export const formatMsg = formati18n({ ...globalMessages, ...moduleMessages, ...messages });
