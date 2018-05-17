import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  shipmentsTracking: {
    id: 'sof.tracking',
    defaultMessage: '状态追踪',
  },
  shipmentsTrackingCustomize: {
    id: 'sof.tracking.customize',
    defaultMessage: '自定义追踪表',
  },
  any: {
    id: 'sof.tracking.filter.any',
    defaultMessage: '不限',
  },
  active: {
    id: 'sof.tracking.filter.active',
    defaultMessage: '进行中',
  },
  delivered: {
    id: 'sof.tracking.filter.delivered',
    defaultMessage: '已完成',
  },
  import: {
    id: 'sof.tracking.filter.import',
    defaultMessage: '进口',
  },
  export: {
    id: 'sof.tracking.filter.export',
    defaultMessage: '出口',
  },
  shipmentNo: {
    id: 'sof.tracking.shipmentno',
    defaultMessage: '货运编号',
  },
  orderNo: {
    id: 'sof.tracking.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'sof.tracking.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'sof.tracking.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'sof.tracking.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'sof.tracking.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'sof.tracking.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'sof.tracking.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'sof.tracking.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'sof.tracking.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'sof.tracking.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'sof.tracking.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'sof.tracking.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'sof.tracking.delivery.ata',
    defaultMessage: '实际交付日',
  },
  opColumn: {
    id: 'sof.tracking.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'sof.tracking.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'sof.tracking.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'sof.tracking.search.placeholder',
    defaultMessage: '搜索',
  },
  importShipments: {
    id: 'sof.tracking.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'sof.tracking.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'sof.tracking.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'sof.tracking.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'sof.tracking.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'sof.tracking.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'sof.tracking.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'sof.tracking.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'sof.tracking.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'sof.tracking.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'sof.tracking.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'sof.tracking.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'sof.tracking.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'sof.tracking.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'sof.tracking.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'sof.tracking.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'sof.tracking.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'sof.tracking.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'sof.tracking.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'sof.tracking.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'sof.tracking.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'sof.tracking.send.transport.dest',
    defaultMessage: '目的地',
  },
  newShipment: {
    id: 'sof.tracking.newshipment',
    defaultMessage: '新建',
  },
  transModeRequired: {
    id: 'sof.tracking.transmode.required',
    defaultMessage: '运输方式必选',
  },
  seaWay: {
    id: 'sof.tracking.sea.way',
    defaultMessage: '海运',
  },
  airWay: {
    id: 'sof.tracking.air.way',
    defaultMessage: '空运',
  },
  paramRequired: {
    id: 'sof.tracking.mode.param.required',
    defaultMessage: '运输参数必填',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
