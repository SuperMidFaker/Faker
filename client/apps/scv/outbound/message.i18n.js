import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  outboundShipments: {
    id: 'scv.shipments.outbound',
    defaultMessage: '进口货运',
  },
  shipmentNo: {
    id: 'scv.shipments.outbound.shipmentno',
    defaultMessage: '货运编号',
  },
  orderNo: {
    id: 'scv.shipments.outbound.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'scv.shipments.outbound.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'scv.shipments.outbound.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'scv.shipments.outbound.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'scv.shipments.outbound.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'scv.shipments.outbound.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'scv.shipments.outbound.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'scv.shipments.outbound.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'scv.shipments.outbound.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'scv.shipments.outbound.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'scv.shipments.outbound.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'scv.shipments.outbound.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'scv.shipments.outbound.delivery.ata',
    defaultMessage: '实际交付日',
  },
  atorigin: {
    id: 'scv.shipments.outbound.at.origin',
    defaultMessage: '启运地',
  },
  intransit: {
    id: 'scv.shipments.outbound.in.transit',
    defaultMessage: '运输中',
  },
  atdest: {
    id: 'scv.shipments.outbound.arrived',
    defaultMessage: '到港',
  },
  atclearance: {
    id: 'scv.shipments.outbound.clearance',
    defaultMessage: '清关',
  },
  atdelivering: {
    id: 'scv.shipments.outbound.inland',
    defaultMessage: '分拨',
  },
  atreceived: {
    id: 'scv.shipments.outbound.delivered',
    defaultMessage: '收货',
  },
  opColumn: {
    id: 'scv.shipments.outbound.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'scv.shipments.outbound.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'scv.shipments.outbound.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'scv.shipments.outbound.search.placeholder',
    defaultMessage: '搜索',
  },
  all: {
    id: 'scv.shipments.outbound.radio.all',
    defaultMessage: '全部',
  },
  importShipments: {
    id: 'scv.shipments.outbound.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'scv.shipments.outbound.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'scv.shipments.outbound.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'scv.shipments.outbound.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'scv.shipments.outbound.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'scv.shipments.outbound.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'scv.shipments.outbound.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'scv.shipments.outbound.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'scv.shipments.outbound.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'scv.shipments.outbound.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'scv.shipments.outbound.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'scv.shipments.outbound.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scv.shipments.outbound.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'scv.shipments.outbound.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'scv.shipments.outbound.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'scv.shipments.outbound.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'scv.shipments.outbound.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'scv.shipments.outbound.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scv.shipments.outbound.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'scv.shipments.outbound.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'scv.shipments.outbound.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scv.shipments.outbound.send.transport.dest',
    defaultMessage: '目的地',
  },
  newShipment: {
    id: 'scv.shipments.outbound.newshipment',
    defaultMessage: '新建',
  },
  transModeRequired: {
    id: 'scv.shipments.outbound.transmode.required',
    defaultMessage: '运输方式必选',
  },
  seaWay: {
    id: 'scv.shipments.outbound.sea.way',
    defaultMessage: '海运',
  },
  airWay: {
    id: 'scv.shipments.outbound.air.way',
    defaultMessage: '空运',
  },
  paramRequired: {
    id: 'scv.shipments.outbound.mode.param.required',
    defaultMessage: '运输参数必填',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
