import { defineMessages } from 'react-intl';

const messages = defineMessages({
  shipmentOrders: {
    id: 'scof.orders',
    defaultMessage: '订单',
  },
  createOrder: {
    id: 'scof.orders.create.order',
    defaultMessage: '新建订单',
  },
  startOrder: {
    id: 'scof.orders.start',
    defaultMessage: '开始',
  },
  shipmentNo: {
    id: 'scof.orders.shipmentno',
    defaultMessage: 'Shipment No.',
  },
  orderNo: {
    id: 'scof.orders.orderno',
    defaultMessage: 'Order No.',
  },
  originCountry: {
    id: 'scof.orders.origin.country',
    defaultMessage: 'Origin Cntry',
  },
  originPort: {
    id: 'scof.orders.origin.port',
    defaultMessage: 'Origin Port',
  },
  destPort: {
    id: 'scof.orders.dest.port',
    defaultMessage: 'Dest. Port',
  },
  mode: {
    id: 'scof.orders.mode',
    defaultMessage: 'Mode',
  },
  etd: {
    id: 'scof.orders.etd',
    defaultMessage: 'ETD',
  },
  atd: {
    id: 'scof.orders.atd',
    defaultMessage: 'ATD',
  },
  eta: {
    id: 'scof.orders.eta',
    defaultMessage: 'ETA',
  },
  ata: {
    id: 'scof.orders.ata',
    defaultMessage: 'ATA',
  },
  status: {
    id: 'scof.orders.status',
    defaultMessage: 'Status',
  },
  customsCleared: {
    id: 'scof.orders.customs.cleared',
    defaultMessage: 'Customs Cleared',
  },
  etaDelivery: {
    id: 'scof.orders.delivery.eta',
    defaultMessage: 'ETA of DLV',
  },
  ataDelivery: {
    id: 'scof.orders.delivery.ata',
    defaultMessage: 'ATA of DLV',
  },
  atorigin: {
    id: 'scof.orders.at.origin',
    defaultMessage: 'At Origin',
  },
  intransit: {
    id: 'scof.orders.in.transit',
    defaultMessage: 'In Transit',
  },
  atdest: {
    id: 'scof.orders.at.dest',
    defaultMessage: 'At Dest.',
  },
  atclearance: {
    id: 'scof.orders.at.clearance',
    defaultMessage: 'Clearance',
  },
  atdelivering: {
    id: 'scof.orders.at.delivering',
    defaultMessage: 'Delivering',
  },
  atreceived: {
    id: 'scof.orders.at.received',
    defaultMessage: 'Received',
  },
  opColumn: {
    id: 'scof.orders.column.operation',
    defaultMessage: 'Operation',
  },
  sendAtDest: {
    id: 'scof.orders.operation.send',
    defaultMessage: 'Send',
  },
  viewTrack: {
    id: 'scof.orders.operation.viewtrack',
    defaultMessage: 'View',
  },
  searchPlaceholder: {
    id: 'scof.orders.search.placeholder',
    defaultMessage: '业务编号或客户单号',
  },
  all: {
    id: 'scof.orders.radio.all',
    defaultMessage: 'All',
  },
  new: {
    id: 'scof.orders.new',
    defaultMessage: '新建订单',
  },
  save: {
    id: 'scof.orders.save',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'scof.orders.cancel',
    defaultMessage: '取消',
  },
  forwarder: {
    id: 'scof.orders.forwarder',
    defaultMessage: 'Forwarder',
  },
  carrier: {
    id: 'scof.orders.carrier',
    defaultMessage: 'Carrier',
  },
  mawb: {
    id: 'scof.orders.mawb',
    defaultMessage: 'MAWB',
  },
  hawb: {
    id: 'scof.orders.hawb',
    defaultMessage: 'HAWB',
  },
  flightNo: {
    id: 'scof.orders.flight.no',
    defaultMessage: 'Flight No.',
  },
  vessel: {
    id: 'scof.orders.vessel',
    defaultMessage: 'Vessel',
  },
  billlading: {
    id: 'scof.orders.billlading',
    defaultMessage: 'B/L',
  },
  voyage: {
    id: 'scof.orders.voyage',
    defaultMessage: 'Voyage',
  },
  containerSizeHeight: {
    id: 'scof.orders.container.size.height',
    defaultMessage: 'Contn. Size/Height',
  },
  moveType: {
    id: 'scof.orders.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'scof.orders.pickup.qty',
    defaultMessage: 'Pickup Qty',
  },
  ctnQty: {
    id: 'scof.orders.ctn.qty',
    defaultMessage: 'CTN Qty',
  },
  grossWeight: {
    id: 'scof.orders.gross.weight',
    defaultMessage: 'Gross Weight',
  },
  broker: {
    id: 'scof.orders.broker',
    defaultMessage: 'Broker',
  },
  cdSheetNo: {
    id: 'scof.orders.cd.sheetno',
    defaultMessage: 'CD Sheets No.',
  },
  sendShipment: {
    id: 'scof.orders.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'scof.orders.send.clearance',
    defaultMessage: 'Clearance',
  },
  sendTrucking: {
    id: 'scof.orders.send.trucking',
    defaultMessage: 'Trucking',
  },
  sendTransport: {
    id: 'scof.orders.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'scof.orders.send.transport.dest',
    defaultMessage: 'Destination',
  },
  declareWay: {
    id: 'scof.orders.delg.declareWay',
    defaultMessage: '报关类型',
  },
  manualNo: {
    id: 'scof.orders.delg.manualNo',
    defaultMessage: '备案号',
  },
  delgGrossWt: {
    id: 'scof.orders.delg.grosswt',
    defaultMessage: '毛重',
  },
  packageNum: {
    id: 'scof.orders.delg.packageNum',
    defaultMessage: '件数',
  },
  transferMode: {
    id: 'scof.orders.biz.cms.transfer.mode',
    defaultMessage: '运输方式',
  },
  tooltipTransferMode: {
    id: 'scof.orders.biz.cms.transfer.mode.tooltip',
    defaultMessage: '运输方式',
  },
  declCustoms: {
    id: 'scof.orders.biz.cms.declcustoms',
    defaultMessage: '申报地海关',
  },
  customsBroker: {
    id: 'scof.orders.biz.cms.customs.broker',
    defaultMessage: '报关行',
  },
  ciqBroker: {
    id: 'scof.orders.biz.cms.ciq.broker',
    defaultMessage: '报检商',
  },
  quoteNo: {
    id: 'scof.orders.biz.quote.no',
    defaultMessage: '报价编号',
  },
  delgWeight: {
    id: 'scof.orders.delg.weight',
    defaultMessage: '总毛重',
  },
  pickupEstDate: {
    id: 'scof.order.shipment.pickup.est.date',
    defaultMessage: '计划提货日期',
  },
  shipmtTransit: {
    id: 'scof.order.shipment.transit.time',
    defaultMessage: '时效(天)',
  },
  deliveryEstDate: {
    id: 'scof.order.shipment.delivery.est.date',
    defaultMessage: '计划送货日期',
  },
  personResponsible: {
    id: 'scof.orders.responsible.person',
    defaultMessage: '执行者',
  },
  addMore: {
    id: 'scof.orders.delg.addMore',
    defaultMessage: '添加',
  },
  created: {
    id: 'scof.orders.status.created',
    defaultMessage: '创建',
  },
  clearancing: {
    id: 'scof.orders.status.clearancing',
    defaultMessage: '清关',
  },
  transporting: {
    id: 'scof.orders.status.transporting',
    defaultMessage: '运输',
  },
  processing: {
    id: 'scof.orders.status.processing',
    defaultMessage: '进行中',
  },
  finished: {
    id: 'scof.orders.status.finished',
    defaultMessage: '已完成',
  },
  clearance: {
    id: 'scof.orders.previewer.clearance',
    defaultMessage: '清关',
  },
  transport: {
    id: 'scof.orders.previewer.transport',
    defaultMessage: '运输',
  },
  charge: {
    id: 'scof.orders.previewer.charge',
    defaultMessage: '费用',
  },
  logs: {
    id: 'scof.orders.previewer.logs',
    defaultMessage: '日志',
  },
  customerInfo: {
    id: 'scof.orders.previewer.customerInfo',
    defaultMessage: '客户信息',
  },
  shipmtSchedule: {
    id: 'scof.orders.previewer.shipmtSchedule',
    defaultMessage: '运输计划',
  },

  client: {
    id: 'scof.orders.client',
    defaultMessage: '客户名称',
  },
  refExternalNo: {
    id: 'scof.orders.previewer.ref.external',
    defaultMessage: '客户单号',
  },
  refWaybillNo: {
    id: 'scof.orders.previewer.ref.waybill',
    defaultMessage: '关联提运单号',
  },
  refEntryNo: {
    id: 'scof.orders.previewer.ref.entryno',
    defaultMessage: '关联报关单号',
  },
  day: {
    id: 'scof.orders.previewer.day',
    defaultMessage: '天',
  },
  remark: {
    id: 'scof.orders.previewer.remark',
    defaultMessage: '备注',
  },
  transitModeInfo: {
    id: 'scof.orders.previewer.transit.mode.info',
    defaultMessage: '运输模式',
  },
  goodsInfo: {
    id: 'scof.orders.previewer.goods.info',
    defaultMessage: '货物信息',
  },
  goodsType: {
    id: 'scof.orders.previewer.goods.type',
    defaultMessage: '货物类型',
  },
  totalCount: {
    id: 'scof.orders.previewer.goods.total.count',
    defaultMessage: '总数量',
  },
  goodsPackage: {
    id: 'scof.orders.previewer.goods.package',
    defaultMessage: '包装',
  },
  totalWeight: {
    id: 'scof.orders.previewer.goods.total.weight',
    defaultMessage: '总重量',
  },
  kilogram: {
    id: 'scof.orders.previewer.goods.kilogram',
    defaultMessage: '公斤',
  },
  insuranceValue: {
    id: 'tcrm.orders.previewer.goods.insurance',
    defaultMessage: '保险货值',
  },
  CNY: {
    id: 'scof.orders.previewer.goods.cny',
    defaultMessage: '元',
  },
  totalVolume: {
    id: 'scof.orders.previewer.goods.total.volume',
    defaultMessage: '总体积',
  },
  cubicMeter: {
    id: 'scof.orders.previewer.goods.cubic.meter',
    defaultMessage: '立方米',
  },
  goodsCode: {
    id: 'scof.orders.previewer.goods.code',
    defaultMessage: '货物代码',
  },
  goodsName: {
    id: 'scof.orders.previewer.goods.name',
    defaultMessage: '货物名称',
  },
  goodsCount: {
    id: 'scof.orders.previewer.goods.count',
    defaultMessage: '数量',
  },
  goodsWeight: {
    id: 'scof.orders.previewer.goods.weight',
    defaultMessage: '重量(千克)',
  },
  goodsVolume: {
    id: 'scof.orders.previewer.goods.volume',
    defaultMessage: '体积',
  },
  goodsLength: {
    id: 'scof.orders.previewer.goods.length',
    defaultMessage: '长(米)',
  },
  goodsWidth: {
    id: 'scof.orders.previewer.goods.width',
    defaultMessage: '宽(米)',
  },
  goodsHeight: {
    id: 'scof.orders.previewer.goods.height',
    defaultMessage: '高(米)',
  },
  goodsRemark: {
    id: 'scof.orders.previewer.goods.remark',
    defaultMessage: '备注',
  },
  vehicleType: {
    id: 'scof.orders.shipment.vehicle.type',
    defaultMessage: '车型',
  },
  vehicleLength: {
    id: 'scof.orders.shipment.vehicle.length',
    defaultMessage: '车长',
  },
  containerPack: {
    id: 'scof.order.shipment.container.pack',
    defaultMessage: '集装箱',
  },
  containerNo: {
    id: 'scof.orders.shipment.container.no',
    defaultMessage: '箱号',
  },
  expressNo: {
    id: 'scof.order.shipment.express.no',
    defaultMessage: '快递单号',
  },
  expressVendor: {
    id: 'scof.order.shipment.express.vendor',
    defaultMessage: '快递公司',
  },
  basicCharge: {
    id: 'scof.orders.previewer.basic.charge',
    defaultMessage: '基本运费',
  },
  revenueItem: {
    id: 'scof.orders.previewer.charge.revenue.item',
    defaultMessage: '收入明细项',
  },
  chargeRate: {
    id: 'scof.orders.previewer.charge.rate',
    defaultMessage: '费率',
  },
  chargeAmount: {
    id: 'scof.orders.previewer.charge.amount',
    defaultMessage: '计费量',
  },
  chargeFee: {
    id: 'scof.orders.previewer.charge.fee',
    defaultMessage: '金额',
  },
  chargeChecked: {
    id: 'scof.orders.previewer.charge.checked',
    defaultMessage: '计入',
  },
  pickupCharge: {
    id: 'scof.orders.previewer.pickup.charge',
    defaultMessage: '提货费',
  },
  deliverCharge: {
    id: 'scof.orders.previewer.deliver.charge',
    defaultMessage: '配送费',
  },
  surcharge: {
    id: 'scof.orders.previewer.surcharge',
    defaultMessage: '运费调整项',
  },
  totalCharge: {
    id: 'scof.orders.previewer.total.charge',
    defaultMessage: '总运费',
  },
  advanceName: {
    id: 'scof.orders.previewer.advance.name',
    defaultMessage: '垫付类型',
  },
  advanceAmount: {
    id: 'scof.orders.previewer.advance.amount',
    defaultMessage: '金额',
  },
  advanceSubmitter: {
    id: 'scof.orders.previewer.advance.submitter',
    defaultMessage: '提交者',
  },
  advanceRemark: {
    id: 'scof.orders.previewer.advance.remark',
    defaultMessage: '备注',
  },

  serviceFee: {
    id: 'scof.orders.previewer.service.fee',
    defaultMessage: '服务费',
  },
  cushionFee: {
    id: 'scof.orders.previewer.cushion.fee',
    defaultMessage: '代垫费',
  },
  feeName: {
    id: 'scof.orders.previewer.fee.name',
    defaultMessage: '费用名称',
  },
  charCount: {
    id: 'scof.orders.previewer.charge.count',
    defaultMessage: '计费数量',
  },
  unitPrice: {
    id: 'scof.orders.previewer.unit.price',
    defaultMessage: '计费单价',
  },
  feeVal: {
    id: 'scof.orders.previewer.fee.val',
    defaultMessage: '费用金额',
  },
  taxFee: {
    id: 'scof.orders.previewer.tax.fee',
    defaultMessage: '税金',
  },
  totalFee: {
    id: 'scof.orders.previewer.total.fee',
    defaultMessage: '应收金额',
  },

  pendingShipmt: {
    id: 'scof.orders.previewer.transport.status.pendingShipmt',
    defaultMessage: '待接单',
  },
  acceptedShipmt: {
    id: 'scof.orders.previewer.transport.status.acceptedShipmt',
    defaultMessage: '待调度',
  },
  dispatchedShipmt: {
    id: 'scof.orders.previewer.transport.status.dispatchedShipmt',
    defaultMessage: '待提货',
  },
  intransitShipmt: {
    id: 'scof.orders.previewer.transport.status.intransitShipmt',
    defaultMessage: '运输中',
  },
  deliveredShipmt: {
    id: 'scof.orders.previewer.transport.status.deliveredShipmt',
    defaultMessage: '已送货',
  },
  podsubmit: {
    id: 'scof.orders.previewer.transport.status.podsubmit',
    defaultMessage: '回单已提交',
  },
  podaccept: {
    id: 'scof.orders.previewer.transport.status.podaccept',
    defaultMessage: '回单已接受',
  },

  unacceptedDelegation: {
    id: 'scof.orders.previewer.clearance.status.unaccepted',
    defaultMessage: '待接单',
  },
  acceptedDelegation: {
    id: 'scof.orders.previewer.clearance.status.accepted',
    defaultMessage: '已接单',
  },
  processedDelegation: {
    id: 'scof.orders.previewer.clearance.status.processed',
    defaultMessage: '制单中',
  },
  declaredDelegation: {
    id: 'scof.orders.previewer.clearance.status.declared',
    defaultMessage: '已申报',
  },
  releasedDelegation: {
    id: 'scof.orders.previewer.clearance.status.released',
    defaultMessage: '已放行',
  },
  declaredPartDelegation: {
    id: 'scof.orders.previewer.clearance.status.declaredPart',
    defaultMessage: '部分申报',
  },
  releasedPartDelegation: {
    id: 'scof.orders.previewer.clearance.status.releasedPart',
    defaultMessage: '部分放行',
  },
  delgDeclare: {
    id: 'scof.orders.progress.action.delg.declare',
    defaultMessage: '发送申报',
  },
  delgInspect: {
    id: 'scof.orders.progress.action.delg.inspect',
    defaultMessage: '查验',
  },
  delgRelease: {
    id: 'scof.orders.progress.action.delg.release',
    defaultMessage: '放行',
  },
  manifestCreate: {
    id: 'scof.orders.progress.action.manifest.create',
    defaultMessage: '生成清单',
  },
  manifestGenerate: {
    id: 'scof.orders.progress.action.manifest.generate',
    defaultMessage: '生成报关建议书',
  },
  customsReview: {
    id: 'scof.orders.progress.action.customs.review',
    defaultMessage: '复核',
  },
  customsDeclare: {
    id: 'scof.orders.progress.action.customs.delcare',
    defaultMessage: '发送申报',
  },
  customsRelease: {
    id: 'scof.orders.progress.action.customs.release',
    defaultMessage: '报关单放行',
  },
  shipmtAccept: {
    id: 'scof.orders.progress.action.shipmt.accept',
    defaultMessage: '接单',
  },
  shipmtDispatch: {
    id: 'scof.orders.progress.action.shipmt.dispatch',
    defaultMessage: '调度',
  },
  shipmtPickup: {
    id: 'scof.orders.progress.action.shipmt.pickup',
    defaultMessage: '提货',
  },
  shipmtDeliver: {
    id: 'scof.orders.progress.action.shipmt.deliver',
    defaultMessage: '交货',
  },
  shipmtPod: {
    id: 'scof.orders.progress.action.shipmt.pod',
    defaultMessage: '回单',
  },
  asnRelease: {
    id: 'scof.orders.progress.action.asn.release',
    defaultMessage: '释放',
  },
  asnInbound: {
    id: 'scof.orders.progress.action.asn.inbound',
    defaultMessage: '收货',
  },
  asnFinish: {
    id: 'scof.orders.progress.action.asn.finished',
    defaultMessage: '入库',
  },
  soRelease: {
    id: 'scof.orders.progress.action.so.release',
    defaultMessage: '释放',
  },
  soOutbound: {
    id: 'scof.orders.progress.action.so.outbound',
    defaultMessage: '出库',
  },
  soFinish: {
    id: 'scof.orders.progress.action.so.finished',
    defaultMessage: '发货',
  },
  regFinish: {
    id: 'scof.orders.progress.action.so.reg.finished',
    defaultMessage: '备案',
  },
  tabOrder: {
    id: 'scof.orders.dock.tab.order',
    defaultMessage: '订单信息',
  },
  tabFlow: {
    id: 'scof.orders.dock.tab.flow',
    defaultMessage: '流程节点',
  },
  tabBilling: {
    id: 'scof.orders.dock.tab.billing',
    defaultMessage: '计费结算',
  },
});

export default messages;
