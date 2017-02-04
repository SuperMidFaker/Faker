import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inventory: {
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
    defaultMessage: '料号',
  },
  category: {
    id: 'scv.inventory.stock.category',
    defaultMessage: '类别',
  },
  warehouse: {
    id: 'scv.inventory.stock.warehouse',
    defaultMessage: '仓库',
  },
  stockPlan: {
    id: 'scv.inventory.stock.stockPlan',
    defaultMessage: '库存',
  },
  unitPrice: {
    id: 'scv.inventory.stock.unitPrice',
    defaultMessage: '单价',
  },
  stockCost: {
    id: 'scv.inventory.stock.stockCost',
    defaultMessage: '库存金额',
  },
  cartonSize: {
    id: 'scv.inventory.stock.cartonSize',
    defaultMessage: '包装大小',
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
