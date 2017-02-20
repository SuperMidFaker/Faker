import { defineMessages } from 'react-intl';

const messages = defineMessages({
  shipmentOrders: {
    id: 'scop.orders',
    defaultMessage: '订单',
  },
  shipmentNo: {
    id: 'scop.orders.shipmentno',
    defaultMessage: 'Shipment No.',
  },
  orderNo: {
    id: 'scop.orders.orderno',
    defaultMessage: 'Order No.',
  },
  originCountry: {
    id: 'scop.orders.origin.country',
    defaultMessage: 'Origin Cntry',
  },
  originPort: {
    id: 'scop.orders.origin.port',
    defaultMessage: 'Origin Port',
  },
  destPort: {
    id: 'scop.orders.dest.port',
    defaultMessage: 'Dest. Port',
  },
  mode: {
    id: 'scop.orders.mode',
    defaultMessage: 'Mode',
  },
  etd: {
    id: 'scop.orders.etd',
    defaultMessage: 'ETD',
  },
  atd: {
    id: 'scop.orders.atd',
    defaultMessage: 'ATD',
  },
  eta: {
    id: 'scop.orders.eta',
    defaultMessage: 'ETA',
  },
  ata: {
    id: 'scop.orders.ata',
    defaultMessage: 'ATA',
  },
  status: {
    id: 'scop.orders.status',
    defaultMessage: 'Status',
  },
  customsCleared: {
    id: 'scop.orders.customs.cleared',
    defaultMessage: 'Customs Cleared',
  },
  etaDelivery: {
    id: 'scop.orders.delivery.eta',
    defaultMessage: 'ETA of DLV',
  },
  ataDelivery: {
    id: 'scop.orders.delivery.ata',
    defaultMessage: 'ATA of DLV',
  },
  atorigin: {
    id: 'scop.orders.at.origin',
    defaultMessage: 'At Origin',
  },
  intransit: {
    id: 'scop.orders.in.transit',
    defaultMessage: 'In Transit',
  },
  atdest: {
    id: 'scop.orders.at.dest',
    defaultMessage: 'At Dest.',
  },
  atclearance: {
    id: 'scop.orders.at.clearance',
    defaultMessage: 'Clearance',
  },
  atdelivering: {
    id: 'scop.orders.at.delivering',
    defaultMessage: 'Delivering',
  },
  atreceived: {
    id: 'scop.orders.at.received',
    defaultMessage: 'Received',
  },
  opColumn: {
    id: 'scop.orders.column.operation',
    defaultMessage: 'Operation',
  },
  sendAtDest: {
    id: 'scop.orders.operation.send',
    defaultMessage: 'Send',
  },
  viewTrack: {
    id: 'scop.orders.operation.viewtrack',
    defaultMessage: 'View',
  },
  searchPlaceholder: {
    id: 'scop.orders.search.placeholder',
    defaultMessage: '业务编号或客户单号',
  },
  all: {
    id: 'scop.orders.radio.all',
    defaultMessage: 'All',
  },
  new: {
    id: 'scop.orders.new',
    defaultMessage: '新建订单',
  },
  save: {
    id: 'scop.orders.save',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'scop.orders.cancel',
    defaultMessage: '取消',
  },
  forwarder: {
    id: 'scop.orders.forwarder',
    defaultMessage: 'Forwarder',
  },
  carrier: {
    id: 'scop.orders.carrier',
    defaultMessage: 'Carrier',
  },
  mawb: {
    id: 'scop.orders.mawb',
    defaultMessage: 'MAWB',
  },
  hawb: {
    id: 'scop.orders.hawb',
    defaultMessage: 'HAWB',
  },
  flightNo: {
    id: 'scop.orders.flight.no',
    defaultMessage: 'Flight No.',
  },
  vessel: {
    id: 'scop.orders.vessel',
    defaultMessage: 'Vessel',
  },
  billlading: {
    id: 'scop.orders.billlading',
    defaultMessage: 'B/L',
  },
  voyage: {
    id: 'scop.orders.voyage',
    defaultMessage: 'Voyage',
  },
  containerSizeHeight: {
    id: 'scop.orders.container.size.height',
    defaultMessage: 'Contn. Size/Height',
  },
  moveType: {
    id: 'scop.orders.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scop.orders.pickup.qty',
    defaultMessage: 'Pickup Qty',
  },
  ctnQty: {
    id: 'scop.orders.ctn.qty',
    defaultMessage: 'CTN Qty',
  },
  grossWeight: {
    id: 'scop.orders.gross.weight',
    defaultMessage: 'Gross Weight',
  },
  broker: {
    id: 'scop.orders.broker',
    defaultMessage: 'Broker',
  },
  cdSheetNo: {
    id: 'scop.orders.cd.sheetno',
    defaultMessage: 'CD Sheets No.',
  },
  sendShipment: {
    id: 'scop.orders.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scop.orders.send.clearance',
    defaultMessage: 'Clearance',
  },
  sendTrucking: {
    id: 'scop.orders.send.trucking',
    defaultMessage: 'Trucking',
  },
  sendTransport: {
    id: 'scop.orders.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scop.orders.send.transport.dest',
    defaultMessage: 'Destination',
  },
  declareWay: {
    id: 'scop.orders.delg.declareWay',
    defaultMessage: '报关类型',
  },
  manualNo: {
    id: 'scop.orders.delg.manualNo',
    defaultMessage: '备案号',
  },
  delgGrossWt: {
    id: 'scop.orders.delg.grosswt',
    defaultMessage: '毛重',
  },
  packageNum: {
    id: 'scop.orders.delg.packageNum',
    defaultMessage: '件数',
  },
  delgWeight: {
    id: 'scop.orders.delg.weight',
    defaultMessage: '总毛重',
  },
  addMore: {
    id: 'scop.orders.delg.addMore',
    defaultMessage: '添加',
  },
  created: {
    id: 'scop.orders.status.created',
    defaultMessage: '创建',
  },
  clearancing: {
    id: 'scop.orders.status.clearancing',
    defaultMessage: '清关',
  },
  transporting: {
    id: 'scop.orders.status.transporting',
    defaultMessage: '运输',
  },
  finished: {
    id: 'scop.orders.status.finished',
    defaultMessage: '完结',
  },
  clearance: {
    id: 'scop.orders.previewer.clearance',
    defaultMessage: '清关',
  },
  transport: {
    id: 'scop.orders.previewer.transport',
    defaultMessage: '运输',
  },
  charge: {
    id: 'scop.orders.previewer.charge',
    defaultMessage: '费用',
  },
  logs: {
    id: 'scop.orders.previewer.logs',
    defaultMessage: '日志',
  },
  customerInfo: {
    id: 'scop.orders.previewer.customerInfo',
    defaultMessage: '客户信息',
  },
  shipmtSchedule: {
    id: 'scop.orders.previewer.shipmtSchedule',
    defaultMessage: '运输计划',
  },

  client: {
    id: 'scop.orders.client',
    defaultMessage: '客户名称',
  },
  refExternalNo: {
    id: 'scop.orders.previewer.ref.external',
    defaultMessage: '客户单号',
  },
  refWaybillNo: {
    id: 'scop.orders.previewer.ref.waybill',
    defaultMessage: '关联提运单号',
  },
  refEntryNo: {
    id: 'scop.orders.previewer.ref.entryno',
    defaultMessage: '关联报关单号',
  },
  pickupEstDate: {
    id: 'scop.orders.previewer.pickup.est.date',
    defaultMessage: '预计提货日期',
  },
  deliveryEstDate: {
    id: 'scop.orders.previewer.delivery.est.date',
    defaultMessage: '预计送货日期',
  },
  day: {
    id: 'scop.orders.previewer.day',
    defaultMessage: '天',
  },
  remark: {
    id: 'scop.orders.previewer.remark',
    defaultMessage: '备注',
  },
  transitModeInfo: {
    id: 'scop.orders.previewer.transit.mode.info',
    defaultMessage: '运输模式',
  },
  goodsInfo: {
    id: 'scop.orders.previewer.goods.info',
    defaultMessage: '货物信息',
  },
  goodsType: {
    id: 'scop.orders.previewer.goods.type',
    defaultMessage: '货物类型',
  },
  totalCount: {
    id: 'scop.orders.previewer.goods.total.count',
    defaultMessage: '总数量',
  },
  goodsPackage: {
    id: 'scop.orders.previewer.goods.package',
    defaultMessage: '包装',
  },
  totalWeight: {
    id: 'scop.orders.previewer.goods.total.weight',
    defaultMessage: '总重量',
  },
  kilogram: {
    id: 'scop.orders.previewer.goods.kilogram',
    defaultMessage: '千克',
  },
  insuranceValue: {
    id: 'tcrm.orders.previewer.goods.insurance',
    defaultMessage: '保险货值',
  },
  CNY: {
    id: 'scop.orders.previewer.goods.cny',
    defaultMessage: '元',
  },
  totalVolume: {
    id: 'scop.orders.previewer.goods.total.volume',
    defaultMessage: '总体积',
  },
  cubicMeter: {
    id: 'scop.orders.previewer.goods.cubic.meter',
    defaultMessage: '立方米',
  },
  goodsCode: {
    id: 'scop.orders.previewer.goods.code',
    defaultMessage: '货物代码',
  },
  goodsName: {
    id: 'scop.orders.previewer.goods.name',
    defaultMessage: '货物名称',
  },
  goodsCount: {
    id: 'scop.orders.previewer.goods.count',
    defaultMessage: '数量',
  },
  goodsWeight: {
    id: 'scop.orders.previewer.goods.weight',
    defaultMessage: '重量(千克)',
  },
  goodsVolume: {
    id: 'scop.orders.previewer.goods.volume',
    defaultMessage: '体积(立方米)',
  },
  goodsLength: {
    id: 'scop.orders.previewer.goods.length',
    defaultMessage: '长(米)',
  },
  goodsWidth: {
    id: 'scop.orders.previewer.goods.width',
    defaultMessage: '宽(米)',
  },
  goodsHeight: {
    id: 'scop.orders.previewer.goods.height',
    defaultMessage: '高(米)',
  },
  goodsRemark: {
    id: 'scop.orders.previewer.goods.remark',
    defaultMessage: '备注',
  },
  vehicleType: {
    id: 'scop.orders.previewer.vehicle.type',
    defaultMessage: '车型',
  },
  vehicleLength: {
    id: 'scop.orders.previewer.vehicle.length',
    defaultMessage: '车长',
  },
  containerNo: {
    id: 'scop.orders.previewer.container.no',
    defaultMessage: '箱号',
  },
  basicCharge: {
    id: 'scop.orders.previewer.basic.charge',
    defaultMessage: '基本运费',
  },
  revenueItem: {
    id: 'scop.orders.previewer.charge.revenue.item',
    defaultMessage: '收入明细项',
  },
  chargeRate: {
    id: 'scop.orders.previewer.charge.rate',
    defaultMessage: '费率',
  },
  chargeAmount: {
    id: 'scop.orders.previewer.charge.amount',
    defaultMessage: '计费量',
  },
  chargeFee: {
    id: 'scop.orders.previewer.charge.fee',
    defaultMessage: '金额',
  },
  chargeChecked: {
    id: 'scop.orders.previewer.charge.checked',
    defaultMessage: '计入',
  },
  pickupCharge: {
    id: 'scop.orders.previewer.pickup.charge',
    defaultMessage: '提货费',
  },
  deliverCharge: {
    id: 'scop.orders.previewer.deliver.charge',
    defaultMessage: '配送费',
  },
  surcharge: {
    id: 'scop.orders.previewer.surcharge',
    defaultMessage: '运费调整项',
  },
  totalCharge: {
    id: 'scop.orders.previewer.total.charge',
    defaultMessage: '总运费',
  },
  advanceName: {
    id: 'scop.orders.previewer.advance.name',
    defaultMessage: '垫付类型',
  },
  advanceAmount: {
    id: 'scop.orders.previewer.advance.amount',
    defaultMessage: '金额',
  },
  advanceSubmitter: {
    id: 'scop.orders.previewer.advance.submitter',
    defaultMessage: '提交者',
  },
  advanceRemark: {
    id: 'scop.orders.previewer.advance.remark',
    defaultMessage: '备注',
  },

  serviceFee: {
    id: 'scop.orders.previewer.service.fee',
    defaultMessage: '服务费',
  },
  cushionFee: {
    id: 'scop.orders.previewer.cushion.fee',
    defaultMessage: '代垫费',
  },
  feeName: {
    id: 'scop.orders.previewer.fee.name',
    defaultMessage: '费用名称',
  },
  charCount: {
    id: 'scop.orders.previewer.charge.count',
    defaultMessage: '计费数量',
  },
  unitPrice: {
    id: 'scop.orders.previewer.unit.price',
    defaultMessage: '计费单价',
  },
  feeVal: {
    id: 'scop.orders.previewer.fee.val',
    defaultMessage: '费用金额',
  },
  taxFee: {
    id: 'scop.orders.previewer.tax.fee',
    defaultMessage: '税金',
  },
  totalFee: {
    id: 'scop.orders.previewer.total.fee',
    defaultMessage: '应收金额',
  },

  pendingShipmt: {
    id: 'scop.orders.previewer.transport.status.pendingShipmt',
    defaultMessage: '待接单',
  },
  acceptedShipmt: {
    id: 'scop.orders.previewer.transport.status.acceptedShipmt',
    defaultMessage: '待调度',
  },
  dispatchedShipmt: {
    id: 'scop.orders.previewer.transport.status.dispatchedShipmt',
    defaultMessage: '待提货',
  },
  intransitShipmt: {
    id: 'scop.orders.previewer.transport.status.intransitShipmt',
    defaultMessage: '运输中',
  },
  deliveredShipmt: {
    id: 'scop.orders.previewer.transport.status.deliveredShipmt',
    defaultMessage: '已送货',
  },
  podsubmit: {
    id: 'scop.orders.previewer.transport.status.podsubmit',
    defaultMessage: '回单已提交',
  },
  podaccept: {
    id: 'scop.orders.previewer.transport.status.podaccept',
    defaultMessage: '回单已接受',
  },

  unacceptedDelegation: {
    id: 'scop.orders.previewer.clearance.status.unaccepted',
    defaultMessage: '待接单',
  },
  acceptedDelegation: {
    id: 'scop.orders.previewer.clearance.status.accepted',
    defaultMessage: '已接单',
  },
  processedDelegation: {
    id: 'scop.orders.previewer.clearance.status.processed',
    defaultMessage: '制单中',
  },
  declaredDelegation: {
    id: 'scop.orders.previewer.clearance.status.declared',
    defaultMessage: '已申报',
  },
  releasedDelegation: {
    id: 'scop.orders.previewer.clearance.status.released',
    defaultMessage: '已放行',
  },
  declaredPartDelegation: {
    id: 'scop.orders.previewer.clearance.status.declaredPart',
    defaultMessage: '部分申报',
  },
  releasedPartDelegation: {
    id: 'scop.orders.previewer.clearance.status.releasedPart',
    defaultMessage: '部分放行',
  },
});

export default messages;
