import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import moduleMessages from 'client/apps/scof/shipments/message.i18n';


const messages = defineMessages({
  shipmentOrder: {
    id: 'component.dock.shipment',
    defaultMessage: '货运订单',
  },
});

export default messages;
export const formatMsg = formati18n({ ...globalMessages, ...moduleMessages, ...messages });
