import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inventory: {
    id: 'scv.inventory',
    defaultMessage: '库存',
  },
  importInventory: {
    id: 'scv.inventory.import',
    defaultMessage: '导入',
  },
  exportInventory: {
    id: 'scv.inventory.export',
    defaultMessage: '导出',
  },
  query: {
    id: 'scv.inventory.query',
    defaultMessage: '查询',
  },
  allWarehouses: {
    id: 'scv.inventory.all.warehouse',
    defaultMessage: '全部仓库',
  },
  sku: {
    id: 'scv.inventory.sku',
    defaultMessage: 'SKU',
  },
  product: {
    id: 'scv.inventory.product',
    defaultMessage: '产品',
  },
  productHint: {
    id: 'scv.inventory.product.hint',
    defaultMessage: '品名/货号',
  },
  category: {
    id: 'scv.inventory.category',
    defaultMessage: '产品分类',
  },
  categoryHint: {
    id: 'scv.inventory.category.hint',
    defaultMessage: '选择产品分类',
  },
  lotProperties: {
    id: 'scv.inventory.lot.properties',
    defaultMessage: '批次属性',
  },
  lotNo: {
    id: 'scv.inventory.lot.no',
    defaultMessage: '批次号',
  },
  lotNoRequired: {
    id: 'scv.inventory.lot.no.required',
    defaultMessage: '批次号查询必填',
  },
  serialNo: {
    id: 'scv.inventory.serial.no',
    defaultMessage: '序列号',
  },
  serialNoRequired: {
    id: 'scv.inventory.serial.no.required',
    defaultMessage: '序列号查询必填',
  },
  specificDate: {
    id: 'scv.inventory.specific.date',
    defaultMessage: '特定日期',
  },
  warehouse: {
    id: 'scv.inventory.warehouse',
    defaultMessage: '所属仓库',
  },
  unitPrice: {
    id: 'scv.inventory.unit.price',
    defaultMessage: '单价',
  },
  priceFrom: {
    id: 'scv.inventory.unit.price.from',
    defaultMessage: '单价范围最低值',
  },
  priceTo: {
    id: 'scv.inventory.unit.price.to',
    defaultMessage: '单价范围最高值',
  },
  cartonLength: {
    id: 'scv.inventory.carton.length',
    defaultMessage: '长(mm)',
  },
  cartonWidth: {
    id: 'scv.inventory.carton.width',
    defaultMessage: '宽(mm)',
  },
  cartonHeight: {
    id: 'scv.inventory.carton.height',
    defaultMessage: '高(mm)',
  },
  skuCbm: {
    id: 'scv.inventory.sku.cbm',
    defaultMessage: '单位CBM',
  },
  cbm: {
    id: 'scv.inventory.cbm',
    defaultMessage: 'CBM',
  },
  productDesc: {
    id: 'scv.inventory.product.desc',
    defaultMessage: '产品描述',
  },

  inventoryStock: {
    id: 'scv.inventory.stock',
    defaultMessage: '库存查询',
  },
  groupBySku: {
    id: 'scv.inventory.stock.group.by.sku',
    defaultMessage: '按SKU合并',
  },
  stockQty: {
    id: 'scv.inventory.stock.qty',
    defaultMessage: '在库数量',
  },
  stockCost: {
    id: 'scv.inventory.stock.cost',
    defaultMessage: '库存成本',
  },

  inventoryTransaction: {
    id: 'scv.inventory.transaction',
    defaultMessage: '进出库记录',
  },
  transTracking: {
    id: 'scv.inventory.transaction.tracking',
    defaultMessage: '进出库追踪',
  },
  trackingByLotNo: {
    id: 'scv.inventory.transaction.tracking.by.lot',
    defaultMessage: '按批次号追踪',
  },
  trackingBySerialNo: {
    id: 'scv.inventory.transaction.tracking.by.serial',
    defaultMessage: '按序列号追踪',
  },
  startDate: {
    id: 'scv.inventory.transaction.start.date',
    defaultMessage: '起始日期',
  },
  startStock: {
    id: 'scv.inventory.transaction.start.stock',
    defaultMessage: '期初库存',
  },
  inboundQty: {
    id: 'scv.inventory.transaction.inbound.qty',
    defaultMessage: '入库数量',
  },
  outboundQty: {
    id: 'scv.inventory.transaction.outbound.qty',
    defaultMessage: '出库数量',
  },
  endDate: {
    id: 'scv.inventory.transaction.end.date',
    defaultMessage: '终止日期',
  },
  endStock: {
    id: 'scv.inventory.transaction.end.stock',
    defaultMessage: '期末库存',
  },
  quantity: {
    id: 'scv.inventory.transaction.quantity',
    defaultMessage: '数量',
  },
  inboundTime: {
    id: 'scv.inventory.transaction.inbound.time',
    defaultMessage: '入库日期',
  },
  ponumber: {
    id: 'scv.inventory.transaction.po.number',
    defaultMessage: 'PO#',
  },
  outboundTime: {
    id: 'scv.inventory.transaction.outbound.time',
    defaultMessage: '出库日期',
  },
  sonumber: {
    id: 'scv.inventory.transaction.so.number',
    defaultMessage: 'SO#',
  },

  shippingOrder: {
    id: 'scv.inventory.shipping.order',
    defaultMessage: '出货订单',
  },

  receivingNotice: {
    id: 'scv.inventory.receiving.notice',
    defaultMessage: '收货通知',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
