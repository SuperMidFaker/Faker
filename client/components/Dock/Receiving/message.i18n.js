import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import moduleMessages from 'client/apps/cwm/receiving/message.i18n';


const messages = defineMessages({
  receivingNotice: {
    id: 'component.dock.receiving.notice',
    defaultMessage: '收货通知',
  },
  asnDetails: {
    id: 'component.dock.asn.details',
    defaultMessage: 'ASN明细',
  },
  tabFTZ: {
    id: 'component.dock.asn.tab.ftz',
    defaultMessage: '海关备案',
  },
});

export default messages;
export const formatMsg = formati18n({ ...globalMessages, ...moduleMessages, ...messages });
