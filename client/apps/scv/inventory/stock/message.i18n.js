import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inventory: {
    id: 'scv.inventory',
    defaultMessage: '库存',
  },
  inventoryStock: {
    id: 'scv.inventory.stock',
    defaultMessage: '库存查询',
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
    id: 'scv.inventory.stock.query',
    defaultMessage: '查询',
  },
  allWarehouses: {
    id: 'scv.inventory.stock.all.warehouse',
    defaultMessage: '全部仓库',
  },
  groupBySku: {
    id: 'scv.inventory.stock.group.by.sku',
    defaultMessage: '按SKU合并',
  },
  sku: {
    id: 'scv.inventory.stock.sku',
    defaultMessage: 'SKU',
  },
  product: {
    id: 'scv.inventory.stock.product',
    defaultMessage: '产品物料',
  },
  productHint: {
    id: 'scv.inventory.stock.product.hint',
    defaultMessage: '品名/料号',
  },
  category: {
    id: 'scv.inventory.stock.category',
    defaultMessage: '产品分类',
  },
  categoryHint: {
    id: 'scv.inventory.stock.category.hint',
    defaultMessage: '选择产品分类',
  },
  lotProperties: {
    id: 'scv.inventory.stock.lot.properties',
    defaultMessage: '批次属性',
  },
  lotNo: {
    id: 'scv.inventory.stock.lot.no',
    defaultMessage: '批次号',
  },
  serialNo: {
    id: 'scv.inventory.stock.serial.no',
    defaultMessage: '序列号',
  },
  specificDate: {
    id: 'scv.inventory.stock.specific.date',
    defaultMessage: '特定日期',
  },
  warehouse: {
    id: 'scv.inventory.stock.warehouse',
    defaultMessage: '仓库',
  },
  stockQty: {
    id: 'scv.inventory.stock.qty',
    defaultMessage: '库存数量',
  },
  unitPrice: {
    id: 'scv.inventory.stock.unit.price',
    defaultMessage: '单价',
  },
  priceFrom: {
    id: 'scv.inventory.stock.unit.price.from',
    defaultMessage: '单价范围最低值',
  },
  priceTo: {
    id: 'scv.inventory.stock.unit.price.to',
    defaultMessage: '单价范围最高值',
  },
  stockCost: {
    id: 'scv.inventory.stock.cost',
    defaultMessage: '库存成本',
  },
  cartonLength: {
    id: 'scv.inventory.stock.carton.length',
    defaultMessage: '长(mm)',
  },
  cartonWidth: {
    id: 'scv.inventory.stock.carton.width',
    defaultMessage: '宽(mm)',
  },
  cartonHeight: {
    id: 'scv.inventory.stock.carton.height',
    defaultMessage: '高(mm)',
  },
  skuCbm: {
    id: 'scv.inventory.stock.sku.cbm',
    defaultMessage: '单位CBM',
  },
  cbm: {
    id: 'scv.inventory.stock.cbm',
    defaultMessage: 'CBM',
  },
  productDesc: {
    id: 'scv.inventory.stock.product.desc',
    defaultMessage: '产品描述',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
