import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'cwm.module.dashboard',
    defaultMessage: '工作台',
  },
  receiving: {
    id: 'cwm.module.receiving',
    defaultMessage: '入库',
  },
  receivingASN: {
    id: 'cwm.module.receiving.asn',
    defaultMessage: '收货通知ASN',
  },
  receivingInbound: {
    id: 'cwm.module.receiving.inbound',
    defaultMessage: '入库单',
  },
  shipping: {
    id: 'cwm.module.shipping',
    defaultMessage: '出库',
  },
  shippingOrder: {
    id: 'cwm.module.shipping.order',
    defaultMessage: '出货订单',
  },
  shippingWave: {
    id: 'cwm.module.shipping.wave',
    defaultMessage: '波次',
  },
  shippingOutbound: {
    id: 'cwm.module.shipping.outbound',
    defaultMessage: '出库单',
  },
  shippingLoad: {
    id: 'cwm.module.shipping.load',
    defaultMessage: '装车单',
  },
  stock: {
    id: 'cwm.module.stock',
    defaultMessage: '在库',
  },
  inventory: {
    id: 'cwm.module.stock.inventory',
    defaultMessage: '库存余量',
  },
  transactions: {
    id: 'cwm.module.stock.transactions',
    defaultMessage: '库存流水',
  },
  movement: {
    id: 'cwm.module.stock.movement',
    defaultMessage: '库存移动',
  },
  transition: {
    id: 'cwm.module.stock.transition',
    defaultMessage: '库存调整',
  },
  counting: {
    id: 'cwm.module.stock.counting',
    defaultMessage: '库存盘点',
  },
  supervision: {
    id: 'cwm.module.supervision',
    defaultMessage: '保税监管',
  },
  supervisionSHFTZ: {
    id: 'cwm.module.supervision.shftz',
    defaultMessage: '上海自贸区监管',
  },
  products: {
    id: 'cwm.module.products',
    defaultMessage: '货品',
  },
  productsSku: {
    id: 'cwm.module.products.sku',
    defaultMessage: 'SKU管理',
  },
  productsLotting: {
    id: 'cwm.module.products.lotting',
    defaultMessage: '批次属性',
  },
  productsKitting: {
    id: 'cwm.module.products.kitting',
    defaultMessage: '组件管理',
  },
  resources: {
    id: 'cwm.module.resources',
    defaultMessage: '资源设置',
  },
  resourcesWarehouse: {
    id: 'cwm.module.resources.warehouse',
    defaultMessage: '仓库',
  },
  resourcesOwner: {
    id: 'cwm.module.resources.owner',
    defaultMessage: '货主',
  },
  resourcesSupplier: {
    id: 'cwm.module.resources.supplier',
    defaultMessage: '供货商',
  },
  resourcesConsignee: {
    id: 'cwm.module.resources.consignee',
    defaultMessage: '收货人',
  },
  settings: {
    id: 'cwm.module.settings',
    defaultMessage: '设置',
  },
  settingsResources: {
    id: 'cwm.module.settings.resources',
    defaultMessage: '资源设置',
  },
  settingsApp: {
    id: 'cwm.module.settings.app',
    defaultMessage: '应用设置',
  },
  warehouse: {
    id: 'cwm.module.settings.warehouse',
    defaultMessage: '仓库',
  },
  rules: {
    id: 'cwm.module.settings.rules',
    defaultMessage: '业务规则',
  },
  templates: {
    id: 'cwm.module.settings.templates',
    defaultMessage: '单据模板',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
