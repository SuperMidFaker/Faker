import { defineMessages } from 'react-intl';

export default defineMessages({
  transportDashboard: {
    id: 'transport.dashboard',
    defaultMessage: '工作台',
  },
  accepted: {
    id: 'transport.dashboard.log.type.accepted',
    defaultMessage: '已受理运单',
  },
  sent: {
    id: 'transport.dashboard.log.type.sent',
    defaultMessage: '已调度运单',
  },
  pickedup: {
    id: 'transport.dashboard.log.type.pickedup',
    defaultMessage: '已提货运单',
  },
  delivered: {
    id: 'transport.dashboard.log.type.delivered',
    defaultMessage: '已送货运单',
  },
  completed: {
    id: 'transport.dashboard.log.type.completed',
    defaultMessage: '已完成运单',
  },
  departurePlace: {
    id: 'transport.dashboard.log.departure.place',
    defaultMessage: '出发地',
  },
  shipmtEstPickupDate: {
    id: 'transport.dashboard.log.est.pickup.date',
    defaultMessage: '预计提货',
  },
  arrivalPlace: {
    id: 'transport.dashboard.log.arrival.place',
    defaultMessage: '到达地',
  },
  shipmtActPickupDate: {
    id: 'transport.dashboard.log.act.pickup.date',
    defaultMessage: '实际提货',
  },
  shipmtEstDeliveryDate: {
    id: 'transport.dashboard.log.est.delivery.date',
    defaultMessage: '预计到达',
  },
  shipmtActDeliveryDate: {
    id: 'transport.dashboard.log.act.delivery.date',
    defaultMessage: '实际到达',
  },
  shipmtStatus: {
    id: 'transport.dashboard.log.shipmt.status',
    defaultMessage: '当前状态',
  },
  shipmtCustomer: {
    id: 'transport.dashboard.log.shipmt.customer',
    defaultMessage: '托运客户',
  },
  shipmtMode: {
    id: 'transport.dashboard.log.shipment.mode',
    defaultMessage: '运输模式',
  },
  pendingShipmt: {
    id: 'transport.dashboard.log.pending.shipment',
    defaultMessage: '待接单',
  },
  acceptedShipmt: {
    id: 'transport.dashboard.log.accepted.shipment',
    defaultMessage: '待调度',
  },
  dispatchedShipmt: {
    id: 'transport.dashboard.log.dispatched.shipment',
    defaultMessage: '待提货',
  },
  intransitShipmt: {
    id: 'transport.dashboard.log.intransit.shipment',
    defaultMessage: '运输中',
  },
  deliveredShipmt: {
    id: 'transport.dashboard.log.delivered.shipment',
    defaultMessage: '已送货',
  },
  proofOfDelivery: {
    id: 'transport.dashboard.log.proof.delivery',
    defaultMessage: '回单',
  },
});
