import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import moduleMessages from 'client/apps/cwm/shipping/message.i18n';


const messages = defineMessages({
  shippingOrder: {
    id: 'component.dock.shipping.order',
    defaultMessage: '出货订单',
  },
});

export default messages;
export const formatMsg = formati18n({ ...globalMessages, ...moduleMessages, ...messages });
