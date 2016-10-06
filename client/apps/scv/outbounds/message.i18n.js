import { defineMessages } from 'react-intl';

const messages = defineMessages({
  shipmentNo: {
    id: 'scv.shipment.outbound.shipmentno',
    defaultMessage: 'Shipment No.',
  },
  orderNo: {
    id: 'scv.shipment.outbound.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'scv.shipment.outbound.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'scv.shipment.outbound.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'scv.shipment.outbound.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'scv.shipment.outbound.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'scv.shipment.outbound.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'scv.shipment.outbound.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'scv.shipment.outbound.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'scv.shipment.outbound.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'scv.shipment.outbound.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'scv.shipment.outbound.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'scv.shipment.outbound.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'scv.shipment.outbound.delivery.ata',
    defaultMessage: '实际交付日',
  },
  atorigin: {
    id: 'scv.shipment.outbound.at.origin',
    defaultMessage: '起运',
  },
  intransit: {
    id: 'scv.shipment.outbound.in.transit',
    defaultMessage: '运输中',
  },
  atdest: {
    id: 'scv.shipment.outbound.at.dest',
    defaultMessage: '到港',
  },
  atclearance: {
    id: 'scv.shipment.outbound.at.clearance',
    defaultMessage: '清关',
  },
  atdelivering: {
    id: 'scv.shipment.outbound.at.delivering',
    defaultMessage: '转运',
  },
  atreceived: {
    id: 'scv.shipment.outbound.at.received',
    defaultMessage: '收货',
  },
  opColumn: {
    id: 'scv.shipment.outbound.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'scv.shipment.outbound.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'scv.shipment.outbound.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'scv.shipment.outbound.search.placeholder',
    defaultMessage: '搜索',
  },
  outboundShipments: {
    id: 'scv.shipment.outbound.outbounds',
    defaultMessage: '出口追踪',
  },
  all: {
    id: 'scv.shipment.outbound.radio.all',
    defaultMessage: '全部',
  },
  importShipments: {
    id: 'scv.shipment.outbound.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'scv.shipment.outbound.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'scv.shipment.outbound.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'scv.shipment.outbound.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'scv.shipment.outbound.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'scv.shipment.outbound.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'scv.shipment.outbound.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'scv.shipment.outbound.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'scv.shipment.outbound.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'scv.shipment.outbound.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'scv.shipment.outbound.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'scv.shipment.outbound.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scv.shipment.outbound.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'scv.shipment.outbound.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'scv.shipment.outbound.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'scv.shipment.outbound.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'scv.shipment.outbound.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'scv.shipment.outbound.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scv.shipment.outbound.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'scv.shipment.outbound.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'scv.shipment.outbound.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scv.shipment.outbound.send.transport.dest',
    defaultMessage: '目的地',
  },
});

export default messages;
