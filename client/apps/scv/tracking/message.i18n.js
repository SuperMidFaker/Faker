import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  shipmentsTracking: {
    id: 'scv.tracking',
    defaultMessage: '货运跟踪',
  },
  shipmentsTrackingCustomize: {
    id: 'scv.tracking.customize',
    defaultMessage: '货运跟踪自定义',
  },
  any: {
    id: 'scv.tracking.filter.any',
    defaultMessage: '不限',
  },
  active: {
    id: 'scv.tracking.filter.active',
    defaultMessage: '进行中',
  },
  delivered: {
    id: 'scv.tracking.filter.delivered',
    defaultMessage: '已完成',
  },
  import: {
    id: 'scv.tracking.filter.import',
    defaultMessage: '进口',
  },
  export: {
    id: 'scv.tracking.filter.export',
    defaultMessage: '出口',
  },
  shipmentNo: {
    id: 'scv.tracking.shipmentno',
    defaultMessage: '货运编号',
  },
  orderNo: {
    id: 'scv.tracking.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'scv.tracking.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'scv.tracking.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'scv.tracking.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'scv.tracking.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'scv.tracking.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'scv.tracking.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'scv.tracking.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'scv.tracking.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'scv.tracking.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'scv.tracking.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'scv.tracking.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'scv.tracking.delivery.ata',
    defaultMessage: '实际交付日',
  },
  opColumn: {
    id: 'scv.tracking.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'scv.tracking.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'scv.tracking.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'scv.tracking.search.placeholder',
    defaultMessage: '搜索',
  },
  importShipments: {
    id: 'scv.tracking.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'scv.tracking.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'scv.tracking.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'scv.tracking.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'scv.tracking.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'scv.tracking.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'scv.tracking.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'scv.tracking.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'scv.tracking.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'scv.tracking.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'scv.tracking.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'scv.tracking.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scv.tracking.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'scv.tracking.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'scv.tracking.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'scv.tracking.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'scv.tracking.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'scv.tracking.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scv.tracking.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'scv.tracking.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'scv.tracking.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scv.tracking.send.transport.dest',
    defaultMessage: '目的地',
  },
  newShipment: {
    id: 'scv.tracking.newshipment',
    defaultMessage: '新建',
  },
  transModeRequired: {
    id: 'scv.tracking.transmode.required',
    defaultMessage: '运输方式必选',
  },
  seaWay: {
    id: 'scv.tracking.sea.way',
    defaultMessage: '海运',
  },
  airWay: {
    id: 'scv.tracking.air.way',
    defaultMessage: '空运',
  },
  paramRequired: {
    id: 'scv.tracking.mode.param.required',
    defaultMessage: '运输参数必填',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
