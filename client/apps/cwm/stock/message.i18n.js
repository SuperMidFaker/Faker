import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  stock: {
    id: 'cwm.stock',
    defaultMessage: '库存',
  },
  stockInventory: {
    id: 'cwm.stock.inventory',
    defaultMessage: '库存余量',
  },
  stockTransition: {
    id: 'cwm.stock.transition',
    defaultMessage: '库存调整',
  },
  stockTransaction: {
    id: 'cwm.stock.transaction',
    defaultMessage: '库存流水',
  },
  query: {
    id: 'cwm.stock.query',
    defaultMessage: '库存查询',
  },
  inquiry: {
    id: 'cwm.stock.action.inquiry',
    defaultMessage: '查询',
  },
  export: {
    id: 'cwm.stock.action.export',
    defaultMessage: '导出',
  },
  owner: {
    id: 'cwm.stock.owner',
    defaultMessage: '货主',
  },
  productNo: {
    id: 'cwm.stock.product.no',
    defaultMessage: '货号',
  },
  descCN: {
    id: 'cwm.stock.desc.cn',
    defaultMessage: '中文品名',
  },
  SKUCategory: {
    id: 'cwm.stock.sku.category',
    defaultMessage: '商品分类',
  },
  location: {
    id: 'cwm.stock.location',
    defaultMessage: '库位',
  },
  inboundDate: {
    id: 'cwm.stock.inbound.date',
    defaultMessage: '入库日期',
  },
  stockingQty: {
    id: 'cwm.stock.stocking.qty',
    defaultMessage: '入库中数量',
  },
  totalQty: {
    id: 'cwm.stock.total.qty',
    defaultMessage: '库存数量',
  },
  availQty: {
    id: 'cwm.stock.avail.qty',
    defaultMessage: '可用数量',
  },
  allocQty: {
    id: 'cwm.stock.alloc.qty',
    defaultMessage: '分配数量',
  },
  frozenQty: {
    id: 'cwm.stock.frozen.qty',
    defaultMessage: '冻结数量',
  },
  bondedQty: {
    id: 'cwm.stock.bonded.qty',
    defaultMessage: '保税数量',
  },
  nonbondedQty: {
    id: 'cwm.stock.nonbonded.qty',
    defaultMessage: '非保税数量',
  },
  attrib1: {
    id: 'cwm.stock.attrib1',
    defaultMessage: '扩展属性1',
  },
  attrib2: {
    id: 'cwm.stock.attrib2',
    defaultMessage: '扩展属性2',
  },
  attrib3: {
    id: 'cwm.stock.attrib3',
    defaultMessage: '扩展属性3',
  },
  attrib4: {
    id: 'cwm.stock.attrib4',
    defaultMessage: '扩展属性4',
  },
  attrib5: {
    id: 'cwm.stock.attrib5',
    defaultMessage: '扩展属性5',
  },
  attrib6: {
    id: 'cwm.stock.attrib6',
    defaultMessage: '扩展属性6',
  },
  attrib7: {
    id: 'cwm.stock.attrib7',
    defaultMessage: '扩展属性7',
  },
  attrib8: {
    id: 'cwm.stock.attrib8',
    defaultMessage: '扩展属性8',
  },
  grossWeight: {
    id: 'cwm.stock.gross.weight',
    defaultMessage: '毛重',
  },
  cbm: {
    id: 'cwm.stock.cbm',
    defaultMessage: '体积',
  },
  traceId: {
    id: 'cwm.stock.trace.id',
    defaultMessage: '追踪ID',
  },
  inCustOrderNo: {
    id: 'cwm.stock.in.custorderno',
    defaultMessage: '入库单号',
  },
  billLadingNo: {
    id: 'cwm.stock.bill.ladingno',
    defaultMessage: '提运单号',
  },
  billLadingMawb: {
    id: 'cwm.stock.bill.lading.mawb',
    defaultMessage: '主运单号',
  },
  billLadingHawb: {
    id: 'cwm.stock.bill.lading.hawb',
    defaultMessage: '分运单号',
  },
  poNo: {
    id: 'cwm.stock.po.no',
    defaultMessage: '采购订单号',
  },
  invoiceNo: {
    id: 'cwm.stock.invoice.no',
    defaultMessage: '发票号',
  },
  asnNo: {
    id: 'cwm.stock.asn.no',
    defaultMessage: 'ASN编号',
  },
  lotNo: {
    id: 'cwm.stock.lot.no',
    defaultMessage: '批次号',
  },
  serialNo: {
    id: 'cwm.stock.serial.no',
    defaultMessage: '序列号',
  },
  virtualWhse: {
    id: 'cwm.stock.virtual.whse',
    defaultMessage: '库别',
  },
  supplierName: {
    id: 'cwm.stock.supplier.name',
    defaultMessage: '供货商',
  },
  bonded: {
    id: 'cwm.stock.bonded',
    defaultMessage: '保税',
  },
  portion: {
    id: 'cwm.stock.portion',
    defaultMessage: '分拨',
  },
  damageLevel: {
    id: 'cwm.stock.damage.level',
    defaultMessage: '包装情况',
  },
  expiryDate: {
    id: 'cwm.stock.expiry.date',
    defaultMessage: '失效日期',
  },
  ftzEntNo: {
    id: 'cwm.stock.ftz.ent.no',
    defaultMessage: '海关入库单号',
  },
  cusDeclNo: {
    id: 'cwm.stock.cus.decl.no',
    defaultMessage: '报关单号',
  },
  ftzEntryId: {
    id: 'cwm.stock.ftz.entry.id',
    defaultMessage: '入库明细ID',
  },
  movement: {
    id: 'cwm.stock.movement',
    defaultMessage: '库存移动',
  },
  movementNo: {
    id: 'cwm.stock.movement.no',
    defaultMessage: '移库单号',
  },
  transactionNo: {
    id: 'cwm.stock.movement.transactionNo',
    defaultMessage: '指令单号',
  },
  reason: {
    id: 'cwm.stock.movement.reason',
    defaultMessage: '原因',
  },
  ownerName: {
    id: 'cwm.stock.movement.ownerName',
    defaultMessage: '货主',
  },
  moveType: {
    id: 'cwm.stock.movement.moveType',
    defaultMessage: '库存移动类型',
  },
  status: {
    id: 'cwm.stock.movement.status',
    defaultMessage: '状态',
  },
  done: {
    id: 'cwm.stock.movement.done',
    defaultMessage: '已完成',
  },
  undone: {
    id: 'cwm.stock.movement.undone',
    defaultMessage: '未完成',
  },
  movingMode: {
    id: 'cwm.stock.movement.movingMode',
    defaultMessage: '操作模式',
  },
  completedDate: {
    id: 'cwm.stock.movement.completedDate',
    defaultMessage: '移动时间',
  },
  movementDetails: {
    id: 'cwm.stock.movement.movementDetails',
    defaultMessage: '移库明细',
  },
  cancelMovement: {
    id: 'cwm.stock.movement.cancelMovement',
    defaultMessage: '取消移库',
  },
  scan: {
    id: 'cwm.stock.movement.mode.scan',
    defaultMessage: '扫码模式',
  },
  manual: {
    id: 'cwm.stock.movement.mode.manual',
    defaultMessage: '手动模式',
  },
  createMovement: {
    id: 'cwm.stock.movement.create',
    defaultMessage: '创建库存移动单',
  },
  transitUploadUpdate: {
    id: 'cwm.stock.transit.upload.update',
    defaultMessage: '批量导入调整',
  },
  moveSearchPlaceholder: {
    id: 'cwm.stock.move.search.placeholder',
    defaultMessage: '移库单号/原因',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
