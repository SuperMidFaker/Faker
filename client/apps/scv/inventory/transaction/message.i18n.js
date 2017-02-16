import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inventory: {
    id: 'scv.inventory',
    defaultMessage: '库存',
  },
  inventoryTransaction: {
    id: 'scv.inventory.transaction',
    defaultMessage: '进出库记录',
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
    id: 'scv.inventory.transaction.query',
    defaultMessage: '查询',
  },
  allWarehouses: {
    id: 'scv.inventory.transaction.all.warehouse',
    defaultMessage: '全部仓库',
  },
  groupBySku: {
    id: 'scv.inventory.transaction.group.by.sku',
    defaultMessage: '按SKU合并',
  },
  sku: {
    id: 'scv.inventory.transaction.sku',
    defaultMessage: 'SKU',
  },
  product: {
    id: 'scv.inventory.transaction.product',
    defaultMessage: '产品物料',
  },
  productHint: {
    id: 'scv.inventory.transaction.product.hint',
    defaultMessage: '品名/料号',
  },
  category: {
    id: 'scv.inventory.transaction.category',
    defaultMessage: '产品分类',
  },
  categoryHint: {
    id: 'scv.inventory.transaction.category.hint',
    defaultMessage: '选择产品分类',
  },
  lotProperties: {
    id: 'scv.inventory.transaction.lot.properties',
    defaultMessage: '批次属性',
  },
  lotNo: {
    id: 'scv.inventory.transaction.lot.no',
    defaultMessage: '批次号',
  },
  serialNo: {
    id: 'scv.inventory.transaction.serial.no',
    defaultMessage: '序列号',
  },
  specificDate: {
    id: 'scv.inventory.transaction.specific.date',
    defaultMessage: '特定日期',
  },
  warehouse: {
    id: 'scv.inventory.transaction.warehouse',
    defaultMessage: '仓库',
  },
  transactionQty: {
    id: 'scv.inventory.transaction.qty',
    defaultMessage: '在库数量',
  },
  unitPrice: {
    id: 'scv.inventory.transaction.unit.price',
    defaultMessage: '单价',
  },
  priceFrom: {
    id: 'scv.inventory.transaction.unit.price.from',
    defaultMessage: '单价范围最低值',
  },
  priceTo: {
    id: 'scv.inventory.transaction.unit.price.to',
    defaultMessage: '单价范围最高值',
  },
  transactionCost: {
    id: 'scv.inventory.transaction.cost',
    defaultMessage: '库存成本',
  },
  cartonLength: {
    id: 'scv.inventory.transaction.carton.length',
    defaultMessage: '长(mm)',
  },
  cartonWidth: {
    id: 'scv.inventory.transaction.carton.width',
    defaultMessage: '宽(mm)',
  },
  cartonHeight: {
    id: 'scv.inventory.transaction.carton.height',
    defaultMessage: '高(mm)',
  },
  skuCbm: {
    id: 'scv.inventory.transaction.sku.cbm',
    defaultMessage: '单位CBM',
  },
  cbm: {
    id: 'scv.inventory.transaction.cbm',
    defaultMessage: 'CBM',
  },
  productDesc: {
    id: 'scv.inventory.transaction.product.desc',
    defaultMessage: '产品描述',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
