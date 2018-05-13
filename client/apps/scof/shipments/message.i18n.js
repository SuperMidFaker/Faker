import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  shipmentOrders: {
    id: 'sof.shipments.shipment',
    defaultMessage: '货运订单',
  },
  shipper: {
    id: 'sof.shipments.shipper',
    defaultMessage: '货主',
  },
  serviceProvider: {
    id: 'sof.shipments.service.provider',
    defaultMessage: '服务商',
  },
  allOrders: {
    id: 'sof.shipments.all',
    defaultMessage: '全部订单',
  },
  statusPending: {
    id: 'sof.shipments.status.pending',
    defaultMessage: '待处理',
  },
  statusActive: {
    id: 'sof.shipments.status.active',
    defaultMessage: '执行中',
  },
  statusExpedited: {
    id: 'sof.shipments.status.expedited',
    defaultMessage: '加急订单',
  },
  statusCompleted: {
    id: 'sof.shipments.status.completed',
    defaultMessage: '已完成',
  },
  startOrder: {
    id: 'sof.shipments.start',
    defaultMessage: '开始',
  },
  shipmentNo: {
    id: 'sof.shipments.shipmentno',
    defaultMessage: 'Shipment No.',
  },
  orderNo: {
    id: 'sof.shipments.orderno',
    defaultMessage: 'Order No.',
  },
  originCountry: {
    id: 'sof.shipments.origin.country',
    defaultMessage: '启运国(地区)',
  },
  destCountry: {
    id: 'sof.shipments.dest.country',
    defaultMessage: '运抵国(地区)',
  },
  importPort: {
    id: 'sof.shipments.import.port',
    defaultMessage: '进口口岸',
  },
  exportPort: {
    id: 'sof.shipments.export.port',
    defaultMessage: '出口口岸',
  },
  deptPort: {
    id: 'sof.shipments.dept.port',
    defaultMessage: '起运港',
  },
  destPort: {
    id: 'sof.shipments.dest.port',
    defaultMessage: '抵运港',
  },
  mode: {
    id: 'sof.shipments.mode',
    defaultMessage: 'Mode',
  },
  etd: {
    id: 'sof.shipments.etd',
    defaultMessage: 'ETD',
  },
  atd: {
    id: 'sof.shipments.atd',
    defaultMessage: 'ATD',
  },
  eta: {
    id: 'sof.shipments.eta',
    defaultMessage: 'ETA',
  },
  ata: {
    id: 'sof.shipments.ata',
    defaultMessage: 'ATA',
  },
  status: {
    id: 'sof.shipments.status',
    defaultMessage: 'Status',
  },
  customsCleared: {
    id: 'sof.shipments.customs.cleared',
    defaultMessage: 'Customs Cleared',
  },
  etaDelivery: {
    id: 'sof.shipments.delivery.eta',
    defaultMessage: 'ETA of DLV',
  },
  ataDelivery: {
    id: 'sof.shipments.delivery.ata',
    defaultMessage: 'ATA of DLV',
  },
  atorigin: {
    id: 'sof.shipments.at.origin',
    defaultMessage: 'At Origin',
  },
  intransit: {
    id: 'sof.shipments.in.transit',
    defaultMessage: 'In Transit',
  },
  atdest: {
    id: 'sof.shipments.at.dest',
    defaultMessage: 'At Dest.',
  },
  atclearance: {
    id: 'sof.shipments.at.clearance',
    defaultMessage: 'Clearance',
  },
  atdelivering: {
    id: 'sof.shipments.at.delivering',
    defaultMessage: 'Delivering',
  },
  atreceived: {
    id: 'sof.shipments.at.received',
    defaultMessage: 'Received',
  },
  allOperators: {
    id: 'sof.orders.allOperators',
    defaultMessage: '全部人员',
  },
  opColumn: {
    id: 'sof.shipments.column.operation',
    defaultMessage: 'Operation',
  },
  sendAtDest: {
    id: 'sof.shipments.operation.send',
    defaultMessage: 'Send',
  },
  viewTrack: {
    id: 'sof.shipments.operation.viewtrack',
    defaultMessage: 'View',
  },
  searchPlaceholder: {
    id: 'sof.shipments.search.placeholder',
    defaultMessage: '业务编号或客户单号',
  },
  all: {
    id: 'sof.shipments.radio.all',
    defaultMessage: 'All',
  },
  new: {
    id: 'sof.shipments.new',
    defaultMessage: '新建订单',
  },
  save: {
    id: 'sof.shipments.save',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'sof.shipments.cancel',
    defaultMessage: '取消',
  },
  forwarder: {
    id: 'sof.shipments.forwarder',
    defaultMessage: 'Forwarder',
  },
  carrier: {
    id: 'sof.shipments.carrier',
    defaultMessage: 'Carrier',
  },
  mawb: {
    id: 'sof.shipments.mawb',
    defaultMessage: 'MAWB',
  },
  hawb: {
    id: 'sof.shipments.hawb',
    defaultMessage: 'HAWB',
  },
  flightNo: {
    id: 'sof.shipments.flight.no',
    defaultMessage: 'Flight No.',
  },
  vessel: {
    id: 'sof.shipments.vessel',
    defaultMessage: 'Vessel',
  },
  billlading: {
    id: 'sof.shipments.billlading',
    defaultMessage: 'B/L',
  },
  voyage: {
    id: 'sof.shipments.voyage',
    defaultMessage: 'Voyage',
  },
  containerSizeHeight: {
    id: 'sof.shipments.container.size.height',
    defaultMessage: 'Contn. Size/Height',
  },
  moveType: {
    id: 'sof.shipments.movement.type',
    defaultMessage: 'Movement Type',
  },
  pickupQty: {
    id: 'sof.shipments.pickup.qty',
    defaultMessage: 'Pickup Qty',
  },
  ctnQty: {
    id: 'sof.shipments.ctn.qty',
    defaultMessage: 'CTN Qty',
  },
  grossWeight: {
    id: 'sof.shipments.gross.weight',
    defaultMessage: 'Gross Weight',
  },
  broker: {
    id: 'sof.shipments.broker',
    defaultMessage: 'Broker',
  },
  cdSheetNo: {
    id: 'sof.shipments.cd.sheetno',
    defaultMessage: 'CD Sheets No.',
  },
  sendShipment: {
    id: 'sof.shipments.sendto',
    defaultMessage: 'Send Shipment',
  },
  sendClearance: {
    id: 'sof.shipments.send.clearance',
    defaultMessage: 'Clearance',
  },
  sendTrucking: {
    id: 'sof.shipments.send.trucking',
    defaultMessage: 'Trucking',
  },
  sendTransport: {
    id: 'sof.shipments.send.transportation',
    defaultMessage: 'Transportation',
  },
  transportDest: {
    id: 'sof.shipments.send.transport.dest',
    defaultMessage: 'Destination',
  },
  declareWay: {
    id: 'sof.shipments.delg.declareWay',
    defaultMessage: '报关类型',
  },
  manualNo: {
    id: 'sof.shipments.delg.manualNo',
    defaultMessage: '备案号',
  },
  delgGrossWt: {
    id: 'sof.shipments.delg.grosswt',
    defaultMessage: '毛重',
  },
  packageNum: {
    id: 'sof.shipments.delg.packageNum',
    defaultMessage: '件数',
  },
  transferMode: {
    id: 'sof.shipments.biz.cms.transfer.mode',
    defaultMessage: '运输方式',
  },
  tooltipTransferMode: {
    id: 'sof.shipments.biz.cms.transfer.mode.tooltip',
    defaultMessage: '运输方式',
  },
  declCustoms: {
    id: 'sof.shipments.biz.cms.declcustoms',
    defaultMessage: '申报地海关',
  },
  customsBroker: {
    id: 'sof.shipments.biz.cms.customs.broker',
    defaultMessage: '报关行',
  },
  ciqBroker: {
    id: 'sof.shipments.biz.cms.ciq.broker',
    defaultMessage: '报检商',
  },
  quoteNo: {
    id: 'sof.shipments.biz.quote.no',
    defaultMessage: '报价编号',
  },
  delgWeight: {
    id: 'sof.shipments.delg.weight',
    defaultMessage: '总毛重',
  },
  pickupEstDate: {
    id: 'sof.order.shipment.pickup.est.date',
    defaultMessage: '计划提货日期',
  },
  shipmtTransit: {
    id: 'sof.order.shipment.transit.time',
    defaultMessage: '时效(天)',
  },
  deliveryEstDate: {
    id: 'sof.order.shipment.delivery.est.date',
    defaultMessage: '计划送货日期',
  },
  personResponsible: {
    id: 'sof.shipments.responsible.person',
    defaultMessage: '跟单人员',
  },
  addMore: {
    id: 'sof.shipments.delg.addMore',
    defaultMessage: '添加',
  },
  created: {
    id: 'sof.shipments.status.created',
    defaultMessage: '创建',
  },
  clearancing: {
    id: 'sof.shipments.status.clearancing',
    defaultMessage: '清关',
  },
  transporting: {
    id: 'sof.shipments.status.transporting',
    defaultMessage: '运输',
  },
  processing: {
    id: 'sof.shipments.status.processing',
    defaultMessage: '进行中',
  },
  finished: {
    id: 'sof.shipments.status.finished',
    defaultMessage: '已完成',
  },
  clearance: {
    id: 'sof.shipments.previewer.clearance',
    defaultMessage: '清关',
  },
  transport: {
    id: 'sof.shipments.previewer.transport',
    defaultMessage: '运输',
  },
  charge: {
    id: 'sof.shipments.previewer.charge',
    defaultMessage: '费用',
  },
  logs: {
    id: 'sof.shipments.previewer.logs',
    defaultMessage: '日志',
  },
  customerInfo: {
    id: 'sof.shipments.previewer.customerInfo',
    defaultMessage: '客户信息',
  },
  shipmtSchedule: {
    id: 'sof.shipments.previewer.shipmtSchedule',
    defaultMessage: '运输计划',
  },

  client: {
    id: 'sof.shipments.client',
    defaultMessage: '客户名称',
  },
  refExternalNo: {
    id: 'sof.shipments.previewer.ref.external',
    defaultMessage: '客户单号',
  },
  refWaybillNo: {
    id: 'sof.shipments.previewer.ref.waybill',
    defaultMessage: '关联提运单号',
  },
  refEntryNo: {
    id: 'sof.shipments.previewer.ref.entryno',
    defaultMessage: '关联报关单号',
  },
  day: {
    id: 'sof.shipments.previewer.day',
    defaultMessage: '天',
  },
  remark: {
    id: 'sof.shipments.previewer.remark',
    defaultMessage: '备注',
  },
  transitModeInfo: {
    id: 'sof.shipments.previewer.transit.mode.info',
    defaultMessage: '运输模式',
  },
  goodsInfo: {
    id: 'sof.shipments.previewer.goods.info',
    defaultMessage: '货物信息',
  },
  goodsType: {
    id: 'sof.shipments.previewer.goods.type',
    defaultMessage: '货物类型',
  },
  totalCount: {
    id: 'sof.shipments.previewer.goods.total.count',
    defaultMessage: '总数量',
  },
  goodsPackage: {
    id: 'sof.shipments.previewer.goods.package',
    defaultMessage: '包装',
  },
  totalWeight: {
    id: 'sof.shipments.previewer.goods.total.weight',
    defaultMessage: '总重量',
  },
  kilogram: {
    id: 'sof.shipments.previewer.goods.kilogram',
    defaultMessage: '公斤',
  },
  insuranceValue: {
    id: 'sof.shipments.previewer.goods.insurance',
    defaultMessage: '保险货值',
  },
  CNY: {
    id: 'sof.shipments.previewer.goods.cny',
    defaultMessage: '元',
  },
  totalVolume: {
    id: 'sof.shipments.previewer.goods.total.volume',
    defaultMessage: '总体积',
  },
  cubicMeter: {
    id: 'sof.shipments.previewer.goods.cubic.meter',
    defaultMessage: '立方米',
  },
  goodsCode: {
    id: 'sof.shipments.previewer.goods.code',
    defaultMessage: '货物代码',
  },
  goodsName: {
    id: 'sof.shipments.previewer.goods.name',
    defaultMessage: '货物名称',
  },
  goodsCount: {
    id: 'sof.shipments.previewer.goods.count',
    defaultMessage: '数量',
  },
  goodsWeight: {
    id: 'sof.shipments.previewer.goods.weight',
    defaultMessage: '重量(千克)',
  },
  goodsVolume: {
    id: 'sof.shipments.previewer.goods.volume',
    defaultMessage: '体积',
  },
  goodsLength: {
    id: 'sof.shipments.previewer.goods.length',
    defaultMessage: '长(米)',
  },
  goodsWidth: {
    id: 'sof.shipments.previewer.goods.width',
    defaultMessage: '宽(米)',
  },
  goodsHeight: {
    id: 'sof.shipments.previewer.goods.height',
    defaultMessage: '高(米)',
  },
  goodsRemark: {
    id: 'sof.shipments.previewer.goods.remark',
    defaultMessage: '备注',
  },
  vehicleType: {
    id: 'sof.shipments.shipment.vehicle.type',
    defaultMessage: '车型',
  },
  vehicleLength: {
    id: 'sof.shipments.shipment.vehicle.length',
    defaultMessage: '车长',
  },
  containerPack: {
    id: 'sof.order.shipment.container.pack',
    defaultMessage: '集装箱',
  },
  containerNo: {
    id: 'sof.shipments.shipment.container.no',
    defaultMessage: '箱号',
  },
  expressNo: {
    id: 'sof.order.shipment.express.no',
    defaultMessage: '快递单号',
  },
  expressVendor: {
    id: 'sof.order.shipment.express.vendor',
    defaultMessage: '快递公司',
  },
  basicCharge: {
    id: 'sof.shipments.previewer.basic.charge',
    defaultMessage: '基本运费',
  },
  revenueItem: {
    id: 'sof.shipments.previewer.charge.revenue.item',
    defaultMessage: '收入明细项',
  },
  chargeRate: {
    id: 'sof.shipments.previewer.charge.rate',
    defaultMessage: '费率',
  },
  chargeAmount: {
    id: 'sof.shipments.previewer.charge.amount',
    defaultMessage: '计费量',
  },
  chargeFee: {
    id: 'sof.shipments.previewer.charge.fee',
    defaultMessage: '金额',
  },
  chargeChecked: {
    id: 'sof.shipments.previewer.charge.checked',
    defaultMessage: '计入',
  },
  pickupCharge: {
    id: 'sof.shipments.previewer.pickup.charge',
    defaultMessage: '提货费',
  },
  deliverCharge: {
    id: 'sof.shipments.previewer.deliver.charge',
    defaultMessage: '配送费',
  },
  surcharge: {
    id: 'sof.shipments.previewer.surcharge',
    defaultMessage: '运费调整项',
  },
  totalCharge: {
    id: 'sof.shipments.previewer.total.charge',
    defaultMessage: '总运费',
  },
  advanceName: {
    id: 'sof.shipments.previewer.advance.name',
    defaultMessage: '垫付类型',
  },
  advanceAmount: {
    id: 'sof.shipments.previewer.advance.amount',
    defaultMessage: '金额',
  },
  advanceSubmitter: {
    id: 'sof.shipments.previewer.advance.submitter',
    defaultMessage: '提交者',
  },
  advanceRemark: {
    id: 'sof.shipments.previewer.advance.remark',
    defaultMessage: '备注',
  },

  serviceFee: {
    id: 'sof.shipments.previewer.service.fee',
    defaultMessage: '服务费',
  },
  cushionFee: {
    id: 'sof.shipments.previewer.cushion.fee',
    defaultMessage: '代垫费',
  },
  feeName: {
    id: 'sof.shipments.previewer.fee.name',
    defaultMessage: '费用名称',
  },
  charCount: {
    id: 'sof.shipments.previewer.charge.count',
    defaultMessage: '计费数量',
  },
  unitPrice: {
    id: 'sof.shipments.previewer.unit.price',
    defaultMessage: '计费单价',
  },
  feeVal: {
    id: 'sof.shipments.previewer.fee.val',
    defaultMessage: '费用金额',
  },
  taxFee: {
    id: 'sof.shipments.previewer.tax.fee',
    defaultMessage: '税金',
  },
  totalFee: {
    id: 'sof.shipments.previewer.total.fee',
    defaultMessage: '应收金额',
  },

  pendingShipmt: {
    id: 'sof.shipments.previewer.transport.status.pendingShipmt',
    defaultMessage: '待接单',
  },
  acceptedShipmt: {
    id: 'sof.shipments.previewer.transport.status.acceptedShipmt',
    defaultMessage: '待调度',
  },
  dispatchedShipmt: {
    id: 'sof.shipments.previewer.transport.status.dispatchedShipmt',
    defaultMessage: '待提货',
  },
  intransitShipmt: {
    id: 'sof.shipments.previewer.transport.status.intransitShipmt',
    defaultMessage: '运输中',
  },
  deliveredShipmt: {
    id: 'sof.shipments.previewer.transport.status.deliveredShipmt',
    defaultMessage: '已送货',
  },
  podsubmit: {
    id: 'sof.shipments.previewer.transport.status.podsubmit',
    defaultMessage: '回单已提交',
  },
  podaccept: {
    id: 'sof.shipments.previewer.transport.status.podaccept',
    defaultMessage: '回单已接受',
  },

  unacceptedDelegation: {
    id: 'sof.shipments.previewer.clearance.status.unaccepted',
    defaultMessage: '待接单',
  },
  acceptedDelegation: {
    id: 'sof.shipments.previewer.clearance.status.accepted',
    defaultMessage: '已接单',
  },
  processedDelegation: {
    id: 'sof.shipments.previewer.clearance.status.processed',
    defaultMessage: '制单中',
  },
  declaredDelegation: {
    id: 'sof.shipments.previewer.clearance.status.declared',
    defaultMessage: '已申报',
  },
  releasedDelegation: {
    id: 'sof.shipments.previewer.clearance.status.released',
    defaultMessage: '已放行',
  },
  declaredPartDelegation: {
    id: 'sof.shipments.previewer.clearance.status.declaredPart',
    defaultMessage: '部分申报',
  },
  releasedPartDelegation: {
    id: 'sof.shipments.previewer.clearance.status.releasedPart',
    defaultMessage: '部分放行',
  },
  delgDeclare: {
    id: 'sof.shipments.progress.action.delg.declare',
    defaultMessage: '发送申报',
  },
  delgInspect: {
    id: 'sof.shipments.progress.action.delg.inspect',
    defaultMessage: '查验',
  },
  delgRelease: {
    id: 'sof.shipments.progress.action.delg.release',
    defaultMessage: '放行',
  },
  manifestCreate: {
    id: 'sof.shipments.progress.action.manifest.create',
    defaultMessage: '生成清单',
  },
  manifestGenerate: {
    id: 'sof.shipments.progress.action.manifest.generate',
    defaultMessage: '生成报关建议书',
  },
  customsReview: {
    id: 'sof.shipments.progress.action.customs.review',
    defaultMessage: '复核',
  },
  customsDeclare: {
    id: 'sof.shipments.progress.action.customs.delcare',
    defaultMessage: '发送申报',
  },
  customsRelease: {
    id: 'sof.shipments.progress.action.customs.release',
    defaultMessage: '报关单放行',
  },
  shipmtAccept: {
    id: 'sof.shipments.progress.action.shipmt.accept',
    defaultMessage: '接单',
  },
  shipmtDispatch: {
    id: 'sof.shipments.progress.action.shipmt.dispatch',
    defaultMessage: '调度',
  },
  shipmtPickup: {
    id: 'sof.shipments.progress.action.shipmt.pickup',
    defaultMessage: '提货',
  },
  shipmtDeliver: {
    id: 'sof.shipments.progress.action.shipmt.deliver',
    defaultMessage: '交货',
  },
  shipmtPod: {
    id: 'sof.shipments.progress.action.shipmt.pod',
    defaultMessage: '回单',
  },
  asnRelease: {
    id: 'sof.shipments.progress.action.asn.release',
    defaultMessage: '释放',
  },
  asnInbound: {
    id: 'sof.shipments.progress.action.asn.inbound',
    defaultMessage: '收货',
  },
  asnFinish: {
    id: 'sof.shipments.progress.action.asn.finished',
    defaultMessage: '入库',
  },
  soRelease: {
    id: 'sof.shipments.progress.action.so.release',
    defaultMessage: '释放',
  },
  soOutbound: {
    id: 'sof.shipments.progress.action.so.outbound',
    defaultMessage: '出库',
  },
  soFinish: {
    id: 'sof.shipments.progress.action.so.finished',
    defaultMessage: '发货',
  },
  soDecl: {
    id: 'sof.shipments.progress.action.so.decl',
    defaultMessage: '保税清关',
  },
  regFinish: {
    id: 'sof.shipments.progress.action.so.reg.finished',
    defaultMessage: '备案',
  },
  tabOrder: {
    id: 'sof.shipments.dock.tab.order',
    defaultMessage: '订单信息',
  },
  tabFlow: {
    id: 'sof.shipments.dock.tab.flow',
    defaultMessage: '流程节点',
  },
  tabAttachment: {
    id: 'sof.shipments.dock.tab.attachment',
    defaultMessage: '附件',
  },
  invoiceNo: {
    id: 'sof.shipments.invoice.no',
    defaultMessage: '发票号',
  },
  invoiceDate: {
    id: 'sof.shipments.invoice.date',
    defaultMessage: '发票日期',
  },
  buyer: {
    id: 'sof.shipments.invoice.buyer',
    defaultMessage: '购买方',
  },
  seller: {
    id: 'sof.shipments.invoice.seller',
    defaultMessage: '销售方',
  },
  'select invoices': {
    id: 'sof.shipments.invoice.select',
    defaultMessage: '选择商业发票',
  },
  invoiceStatus: {
    id: 'sof.shipments.invoice.status',
    defaultMessage: '发票状态',
  },
  shipped: {
    id: 'sof.shipments.invoice.shipped',
    defaultMessage: '已发货',
  },
  unshipped: {
    id: 'sof.shipments.invoice.unshipped',
    defaultMessage: '未发货',
  },
  category: {
    id: 'sof.shipments.invoice.category',
    defaultMessage: '发票类别',
  },
  coefficient: {
    id: 'sof.shipments.invoice.coefficient',
    defaultMessage: '金额调整系数',
  },
  poNo: {
    id: 'sof.shipments.invoice.poNo',
    defaultMessage: '订单号',
  },
  totalAmount: {
    id: 'sof.shipments.invoice.totalAmount',
    defaultMessage: '总价',
  },
  currency: {
    id: 'sof.shipments.invoice.currency',
    defaultMessage: '币制',
  },
  totalQty: {
    id: 'sof.shipments.invoice.totalQty',
    defaultMessage: '总数量',
  },
  totalNetWt: {
    id: 'sof.shipments.invoice.totalNetWt',
    defaultMessage: '总净重',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
