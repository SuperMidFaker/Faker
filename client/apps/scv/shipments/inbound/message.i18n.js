import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  shipmentsTracking: {
    id: 'scv.shipments',
    defaultMessage: '状态跟踪',
  },
  any: {
    id: 'scv.shipments.filter.any',
    defaultMessage: '不限',
  },
  active: {
    id: 'scv.shipments.filter.active',
    defaultMessage: '进行中',
  },
  delivered: {
    id: 'scv.shipments.filter.delivered',
    defaultMessage: '已完成',
  },
  import: {
    id: 'scv.shipments.filter.import',
    defaultMessage: '进口',
  },
  export: {
    id: 'scv.shipments.filter.export',
    defaultMessage: '出口',
  },
  shipmentNo: {
    id: 'scv.shipments.shipmentno',
    defaultMessage: '货运编号',
  },
  orderNo: {
    id: 'scv.shipments.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'scv.shipments.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'scv.shipments.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'scv.shipments.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'scv.shipments.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'scv.shipments.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'scv.shipments.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'scv.shipments.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'scv.shipments.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'scv.shipments.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'scv.shipments.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'scv.shipments.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'scv.shipments.delivery.ata',
    defaultMessage: '实际交付日',
  },
  opColumn: {
    id: 'scv.shipments.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'scv.shipments.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'scv.shipments.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'scv.shipments.search.placeholder',
    defaultMessage: '搜索',
  },
  importShipments: {
    id: 'scv.shipments.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'scv.shipments.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'scv.shipments.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'scv.shipments.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'scv.shipments.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'scv.shipments.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'scv.shipments.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'scv.shipments.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'scv.shipments.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'scv.shipments.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'scv.shipments.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'scv.shipments.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scv.shipments.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'scv.shipments.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'scv.shipments.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'scv.shipments.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'scv.shipments.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'scv.shipments.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scv.shipments.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'scv.shipments.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'scv.shipments.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scv.shipments.send.transport.dest',
    defaultMessage: '目的地',
  },
  newShipment: {
    id: 'scv.shipments.newshipment',
    defaultMessage: '新建',
  },
  transModeRequired: {
    id: 'scv.shipments.transmode.required',
    defaultMessage: '运输方式必选',
  },
  seaWay: {
    id: 'scv.shipments.sea.way',
    defaultMessage: '海运',
  },
  airWay: {
    id: 'scv.shipments.air.way',
    defaultMessage: '空运',
  },
  paramRequired: {
    id: 'scv.shipments.mode.param.required',
    defaultMessage: '运输参数必填',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
