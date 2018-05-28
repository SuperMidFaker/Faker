import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import moduleMessages from 'client/apps/scof/shipments/message.i18n';


const messages = defineMessages({
  shipmentOrder: {
    id: 'component.dock.shipment',
    defaultMessage: '货运订单',
  },
  commInvoices: {
    id: 'component.dock.comm.invoices',
    defaultMessage: '商业发票',
  },
  container: {
    id: 'component.dock.container',
    defaultMessage: '集装箱',
  },
});

export default messages;
export const formatMsg = formati18n({ ...globalMessages, ...moduleMessages, ...messages });
