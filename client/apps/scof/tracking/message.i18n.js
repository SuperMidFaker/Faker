import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  shipmentsTracking: {
    id: 'scof.tracking',
    defaultMessage: '状态追踪',
  },
  shipmentsTrackingCustomize: {
    id: 'scof.tracking.customize',
    defaultMessage: '自定义追踪表',
  },
  any: {
    id: 'scof.tracking.filter.any',
    defaultMessage: '不限',
  },
  active: {
    id: 'scof.tracking.filter.active',
    defaultMessage: '进行中',
  },
  delivered: {
    id: 'scof.tracking.filter.delivered',
    defaultMessage: '已完成',
  },
  import: {
    id: 'scof.tracking.filter.import',
    defaultMessage: '进口',
  },
  export: {
    id: 'scof.tracking.filter.export',
    defaultMessage: '出口',
  },
  shipmentNo: {
    id: 'scof.tracking.shipmentno',
    defaultMessage: '货运编号',
  },
  orderNo: {
    id: 'scof.tracking.orderno',
    defaultMessage: '订单号',
  },
  originCountry: {
    id: 'scof.tracking.origin.country',
    defaultMessage: '起运国',
  },
  originPort: {
    id: 'scof.tracking.origin.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'scof.tracking.dest.port',
    defaultMessage: '卸货港',
  },
  mode: {
    id: 'scof.tracking.mode',
    defaultMessage: '运输方式',
  },
  etd: {
    id: 'scof.tracking.etd',
    defaultMessage: '预计离港日',
  },
  atd: {
    id: 'scof.tracking.atd',
    defaultMessage: '实际离港日',
  },
  eta: {
    id: 'scof.tracking.eta',
    defaultMessage: '预计到港日',
  },
  ata: {
    id: 'scof.tracking.ata',
    defaultMessage: '实际到港日',
  },
  status: {
    id: 'scof.tracking.status',
    defaultMessage: '状态',
  },
  customsCleared: {
    id: 'scof.tracking.customs.cleared',
    defaultMessage: '清关放行日',
  },
  etaDelivery: {
    id: 'scof.tracking.delivery.eta',
    defaultMessage: '预计交付日',
  },
  ataDelivery: {
    id: 'scof.tracking.delivery.ata',
    defaultMessage: '实际交付日',
  },
  opColumn: {
    id: 'scof.tracking.column.operation',
    defaultMessage: '操作',
  },
  sendAtDest: {
    id: 'scof.tracking.operation.send',
    defaultMessage: '发送',
  },
  viewTrack: {
    id: 'scof.tracking.operation.viewtrack',
    defaultMessage: '查看',
  },
  searchPlaceholder: {
    id: 'scof.tracking.search.placeholder',
    defaultMessage: '搜索',
  },
  importShipments: {
    id: 'scof.tracking.import',
    defaultMessage: '导入',
  },
  forwarder: {
    id: 'scof.tracking.forwarder',
    defaultMessage: '货代',
  },
  carrier: {
    id: 'scof.tracking.carrier',
    defaultMessage: '承运',
  },
  mawb: {
    id: 'scof.tracking.mawb',
    defaultMessage: '主运单号',
  },
  hawb: {
    id: 'scof.tracking.hawb',
    defaultMessage: '分运单号',
  },
  flightNo: {
    id: 'scof.tracking.flight.no',
    defaultMessage: '航班号',
  },
  vessel: {
    id: 'scof.tracking.vessel',
    defaultMessage: '船名',
  },
  billlading: {
    id: 'scof.tracking.billlading',
    defaultMessage: '提单号',
  },
  voyage: {
    id: 'scof.tracking.voyage',
    defaultMessage: '航次',
  },
  containerNo: {
    id: 'scof.tracking.container.no',
    defaultMessage: '集装箱号',
  },
  containerSizeHeight: {
    id: 'scof.tracking.container.size.height',
    defaultMessage: '集装箱尺寸/高度',
  },
  moveType: {
    id: 'scof.tracking.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scof.tracking.pickup.qty',
    defaultMessage: '提货件数',
  },
  ctnQty: {
    id: 'scof.tracking.ctn.qty',
    defaultMessage: '箱数',
  },
  grossWeight: {
    id: 'scof.tracking.gross.weight',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'scof.tracking.broker',
    defaultMessage: '报关行',
  },
  cdSheetNo: {
    id: 'scof.tracking.cd.sheetno',
    defaultMessage: '报关单号',
  },
  sendShipment: {
    id: 'scof.tracking.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scof.tracking.send.clearance',
    defaultMessage: '清关',
  },
  sendTrucking: {
    id: 'scof.tracking.send.trucking',
    defaultMessage: '运输',
  },
  sendTransport: {
    id: 'scof.tracking.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scof.tracking.send.transport.dest',
    defaultMessage: '目的地',
  },
  newShipment: {
    id: 'scof.tracking.newshipment',
    defaultMessage: '新建',
  },
  transModeRequired: {
    id: 'scof.tracking.transmode.required',
    defaultMessage: '运输方式必选',
  },
  seaWay: {
    id: 'scof.tracking.sea.way',
    defaultMessage: '海运',
  },
  airWay: {
    id: 'scof.tracking.air.way',
    defaultMessage: '空运',
  },
  paramRequired: {
    id: 'scof.tracking.mode.param.required',
    defaultMessage: '运输参数必填',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
