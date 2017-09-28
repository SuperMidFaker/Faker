import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'bss.module.dashboard',
    defaultMessage: '工作台',
  },
  receiving: {
    id: 'bss.module.receiving',
    defaultMessage: '入库',
  },
  receivingASN: {
    id: 'bss.module.receiving.asn',
    defaultMessage: '收货通知ASN',
  },
  receivingInbound: {
    id: 'bss.module.receiving.inbound',
    defaultMessage: '入库单',
  },
  shipping: {
    id: 'bss.module.shipping',
    defaultMessage: '出库',
  },
  shippingOrder: {
    id: 'bss.module.shipping.order',
    defaultMessage: '出货订单',
  },
  shippingWave: {
    id: 'bss.module.shipping.wave',
    defaultMessage: '波次',
  },
  shippingOutbound: {
    id: 'bss.module.shipping.outbound',
    defaultMessage: '出库单',
  },
  stock: {
    id: 'bss.module.stock',
    defaultMessage: '在库',
  },
  inventory: {
    id: 'bss.module.stock.inventory',
    defaultMessage: '库存余量',
  },
  transactions: {
    id: 'bss.module.stock.transactions',
    defaultMessage: '库存流水',
  },
  movement: {
    id: 'bss.module.stock.movement',
    defaultMessage: '库存移动',
  },
  transition: {
    id: 'bss.module.stock.transition',
    defaultMessage: '库存调整',
  },
  counting: {
    id: 'bss.module.stock.counting',
    defaultMessage: '库存盘点',
  },
  supervision: {
    id: 'bss.module.supervision',
    defaultMessage: '保税监管',
  },
  supervisionSHFTZ: {
    id: 'bss.module.supervision.shftz',
    defaultMessage: '上海自贸区监管',
  },
  products: {
    id: 'bss.module.products',
    defaultMessage: '货品',
  },
  productsSku: {
    id: 'bss.module.products.sku',
    defaultMessage: 'SKU管理',
  },
  productsLotting: {
    id: 'bss.module.products.lotting',
    defaultMessage: '批次属性',
  },
  productsKitting: {
    id: 'bss.module.products.kitting',
    defaultMessage: '组件管理',
  },
  resources: {
    id: 'bss.module.resources',
    defaultMessage: '资源设置',
  },
  resourcesWarehouse: {
    id: 'bss.module.resources.warehouse',
    defaultMessage: '仓库',
  },
  resourcesOwner: {
    id: 'bss.module.resources.owner',
    defaultMessage: '货主',
  },
  resourcesSupplier: {
    id: 'bss.module.resources.supplier',
    defaultMessage: '供应商',
  },
  resourcesConsignee: {
    id: 'bss.module.resources.consignee',
    defaultMessage: '收货人',
  },
  settings: {
    id: 'bss.module.settings',
    defaultMessage: '设置',
  },
  settingsResources: {
    id: 'bss.module.settings.resources',
    defaultMessage: '资源设置',
  },
  settingsApp: {
    id: 'bss.module.settings.app',
    defaultMessage: '应用设置',
  },
  warehouse: {
    id: 'bss.module.settings.warehouse',
    defaultMessage: '仓库',
  },
  rules: {
    id: 'bss.module.settings.rules',
    defaultMessage: '业务规则',
  },
  templates: {
    id: 'bss.module.settings.templates',
    defaultMessage: '单据模板',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
