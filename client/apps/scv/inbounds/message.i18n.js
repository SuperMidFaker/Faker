import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  shipmentNo: {
    id: 'scv.shipment.inbound.shipmentno',
    defaultMessage: 'Shipment No.',
  },
  orderNo: {
    id: 'scv.shipment.inbound.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'scv.shipment.inbound.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'scv.shipment.inbound.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'scv.shipment.inbound.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'scv.shipment.inbound.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'scv.shipment.inbound.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'scv.shipment.inbound.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'scv.shipment.inbound.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'scv.shipment.inbound.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'scv.shipment.inbound.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'scv.shipment.inbound.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'scv.shipment.inbound.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'scv.shipment.inbound.delivery.ata',
    defaultMessage: '实际交付日',
  },
  atorigin: {
    id: 'scv.shipment.inbound.at.origin',
    defaultMessage: '启运地',
  },
  intransit: {
    id: 'scv.shipment.inbound.in.transit',
    defaultMessage: '运输中',
  },
  atdest: {
    id: 'scv.shipment.inbound.arrived',
    defaultMessage: '到港',
  },
  atclearance: {
    id: 'scv.shipment.inbound.clearance',
    defaultMessage: '清关',
  },
  atdelivering: {
    id: 'scv.shipment.inbound.inland',
    defaultMessage: '分拨',
  },
  atreceived: {
    id: 'scv.shipment.inbound.delivered',
    defaultMessage: '收货',
  },
  opColumn: {
    id: 'scv.shipment.inbound.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'scv.shipment.inbound.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'scv.shipment.inbound.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'scv.shipment.inbound.search.placeholder',
    defaultMessage: '搜索',
  },
  inboundShipments: {
    id: 'scv.shipment.inbound.inbounds',
    defaultMessage: '进口追踪',
  },
  all: {
    id: 'scv.shipment.inbound.radio.all',
    defaultMessage: '全部',
  },
  importShipments: {
    id: 'scv.shipment.inbound.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'scv.shipment.inbound.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'scv.shipment.inbound.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'scv.shipment.inbound.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'scv.shipment.inbound.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'scv.shipment.inbound.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'scv.shipment.inbound.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'scv.shipment.inbound.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'scv.shipment.inbound.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'scv.shipment.inbound.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'scv.shipment.inbound.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'scv.shipment.inbound.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scv.shipment.inbound.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'scv.shipment.inbound.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'scv.shipment.inbound.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'scv.shipment.inbound.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'scv.shipment.inbound.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'scv.shipment.inbound.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scv.shipment.inbound.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'scv.shipment.inbound.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'scv.shipment.inbound.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scv.shipment.inbound.send.transport.dest',
    defaultMessage: '目的地',
  },
  newShipment: {
    id: 'scv.shipment.inbound.newshipment',
    defaultMessage: '新建',
  },
  transModeRequired: {
    id: 'scv.shipment.inbound.transmode.required',
    defaultMessage: '运输方式必选',
  },
  seaWay: {
    id: 'scv.shipment.inbound.sea.way',
    defaultMessage: '海运',
  },
  airWay: {
    id: 'scv.shipment.inbound.air.way',
    defaultMessage: '空运',
  },
  paramRequired: {
    id: 'scv.shipment.inbound.mode.param.required',
    defaultMessage: '运输参数必填',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
