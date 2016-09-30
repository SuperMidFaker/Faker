import { defineMessages } from 'react-intl';

const messages = defineMessages({
  shipmentNo: {
    id: 'scv.shipment.shipmentno',
    defaultMessage: 'Shipment No.',
  },
  orderNo: {
    id: 'scv.shipment.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'scv.shipment.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'scv.shipment.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'scv.shipment.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'scv.shipment.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'scv.shipment.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'scv.shipment.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'scv.shipment.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'scv.shipment.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'scv.shipment.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'scv.shipment.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'scv.shipment.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'scv.shipment.delivery.ata',
    defaultMessage: '实际交付日',
  },
  atorigin: {
    id: 'scv.shipment.at.origin',
    defaultMessage: '起运',
  },
  intransit: {
    id: 'scv.shipment.in.transit',
    defaultMessage: '运输中',
  },
  atdest: {
    id: 'scv.shipment.at.dest',
    defaultMessage: '到港',
  },
  atclearance: {
    id: 'scv.shipment.at.clearance',
    defaultMessage: '清关',
  },
  atdelivering: {
    id: 'scv.shipment.at.delivering',
    defaultMessage: '转运',
  },
  atreceived: {
    id: 'scv.shipment.at.received',
    defaultMessage: '收货',
  },
  opColumn: {
    id: 'scv.shipment.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'scv.shipment.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'scv.shipment.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'scv.shipment.search.placeholder',
    defaultMessage: '搜索',
  },
  inboundShipments: {
    id: 'scv.shipment.inbounds',
    defaultMessage: '进口追踪',
  },
  all: {
    id: 'scv.shipment.radio.all',
    defaultMessage: '全部',
  },
  importShipments: {
    id: 'scv.shipment.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'scv.shipment.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'scv.shipment.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'scv.shipment.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'scv.shipment.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'scv.shipment.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'scv.shipment.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'scv.shipment.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'scv.shipment.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'scv.shipment.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'scv.shipment.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'scv.shipment.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scv.shipment.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'scv.shipment.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'scv.shipment.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'scv.shipment.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'scv.shipment.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'scv.shipment.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scv.shipment.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'scv.shipment.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'scv.shipment.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scv.shipment.send.transport.dest',
    defaultMessage: '目的地',
  },
});

export default messages;
