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
  finishedProduct: {
    id: 'scv.inventory.stock.finishedProduct',
    defaultMessage: 'SKU',
  },
  category: {
    id: 'scv.inventory.stock.category',
    defaultMessage: '大类',
  },
  warehouse: {
    id: 'scv.inventory.stock.warehouse',
    defaultMessage: '仓库',
  },
  stockPlan: {
    id: 'scv.inventory.stock.stockPlan',
    defaultMessage: '库存数量',
  },
  unitPrice: {
    id: 'scv.inventory.stock.unitPrice',
    defaultMessage: '单价',
  },
  stockCost: {
    id: 'scv.inventory.stock.stockCost',
    defaultMessage: '总金额',
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
  cbmPerSku: {
    id: 'scv.inventory.stock.cbmPerSku',
    defaultMessage: '单位CBM',
  },
  cbm: {
    id: 'scv.inventory.stock.cbm',
    defaultMessage: 'CBM',
  },
  productDesc: {
    id: 'scv.inventory.stock.productDesc',
    defaultMessage: '产品描述',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
