import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inboundShipments: {
    id: 'scv.shipments.inbound',
    defaultMessage: '进口货运',
  },
  shipmentNo: {
    id: 'scv.shipments.inbound.shipmentno',
    defaultMessage: '货运编号',
  },
  orderNo: {
    id: 'scv.shipments.inbound.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'scv.shipments.inbound.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'scv.shipments.inbound.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'scv.shipments.inbound.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'scv.shipments.inbound.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'scv.shipments.inbound.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'scv.shipments.inbound.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'scv.shipments.inbound.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'scv.shipments.inbound.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'scv.shipments.inbound.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'scv.shipments.inbound.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'scv.shipments.inbound.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'scv.shipments.inbound.delivery.ata',
    defaultMessage: '实际交付日',
  },
  atorigin: {
    id: 'scv.shipments.inbound.at.origin',
    defaultMessage: '启运地',
  },
  intransit: {
    id: 'scv.shipments.inbound.in.transit',
    defaultMessage: '运输中',
  },
  atdest: {
    id: 'scv.shipments.inbound.arrived',
    defaultMessage: '到港',
  },
  atclearance: {
    id: 'scv.shipments.inbound.clearance',
    defaultMessage: '清关',
  },
  atdelivering: {
    id: 'scv.shipments.inbound.inland',
    defaultMessage: '分拨',
  },
  atreceived: {
    id: 'scv.shipments.inbound.delivered',
    defaultMessage: '收货',
  },
  opColumn: {
    id: 'scv.shipments.inbound.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'scv.shipments.inbound.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'scv.shipments.inbound.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'scv.shipments.inbound.search.placeholder',
    defaultMessage: '搜索',
  },
  all: {
    id: 'scv.shipments.inbound.radio.all',
    defaultMessage: '全部',
  },
  importShipments: {
    id: 'scv.shipments.inbound.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'scv.shipments.inbound.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'scv.shipments.inbound.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'scv.shipments.inbound.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'scv.shipments.inbound.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'scv.shipments.inbound.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'scv.shipments.inbound.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'scv.shipments.inbound.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'scv.shipments.inbound.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'scv.shipments.inbound.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'scv.shipments.inbound.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'scv.shipments.inbound.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scv.shipments.inbound.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'scv.shipments.inbound.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'scv.shipments.inbound.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'scv.shipments.inbound.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'scv.shipments.inbound.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'scv.shipments.inbound.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scv.shipments.inbound.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'scv.shipments.inbound.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'scv.shipments.inbound.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scv.shipments.inbound.send.transport.dest',
    defaultMessage: '目的地',
  },
  newShipment: {
    id: 'scv.shipments.inbound.newshipment',
    defaultMessage: '新建',
  },
  transModeRequired: {
    id: 'scv.shipments.inbound.transmode.required',
    defaultMessage: '运输方式必选',
  },
  seaWay: {
    id: 'scv.shipments.inbound.sea.way',
    defaultMessage: '海运',
  },
  airWay: {
    id: 'scv.shipments.inbound.air.way',
    defaultMessage: '空运',
  },
  paramRequired: {
    id: 'scv.shipments.inbound.mode.param.required',
    defaultMessage: '运输参数必填',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
