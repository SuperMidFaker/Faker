import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  products: {
    id: 'cwm.products',
    defaultMessage: '货品',
  },
  productsSku: {
    id: 'cwm.products.sku',
    defaultMessage: 'SKU管理',
  },
  syncTradeItems: {
    id: 'cwm.products.sku.sync.tradeitems',
    defaultMessage: '同步商品归类库',
  },
  productImport: {
    id: 'cwm.products.import',
    defaultMessage: '导入',
  },
  save: {
    id: 'cwm.products.save',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'cwm.products.cancel',
    defaultMessage: '取消',
  },
  createSKU: {
    id: 'cwm.products.sku.create',
    defaultMessage: '新建SKU',
  },
  productSearchPlaceholder: {
    id: 'cwm.products.search.placeholder',
    defaultMessage: 'SKU或商品货号',
  },
  ownerSearch: {
    id: 'cwm.products.owner.search',
    defaultMessage: '货主名称或编号',
  },
  productNo: {
    id: 'cwm.products.productno',
    defaultMessage: '货号',
  },
  hscode: {
    id: 'cwm.products.hscode',
    defaultMessage: '商品编码',
  },
  descCN: {
    id: 'cwm.products.sku.cn.desc',
    defaultMessage: '中文品名',
  },
  descEN: {
    id: 'cwm.products.sku.en.desc',
    defaultMessage: '英文品名',
  },
  category: {
    id: 'cwm.products.product.category',
    defaultMessage: '商品分类',
  },
  measureUnit: {
    id: 'cwm.products.product.measure.unit',
    defaultMessage: '计量单位',
  },
  unitPrice: {
    id: 'cwm.products.product.unit.price',
    defaultMessage: '单价',
  },
  alias1: {
    id: 'cwm.products.product.alias1',
    defaultMessage: '别名1',
  },
  alias2: {
    id: 'cwm.products.product.alias2',
    defaultMessage: '别名2',
  },
  alias3: {
    id: 'cwm.products.product.alias3',
    defaultMessage: '别名3',
  },
  skuPack: {
    id: 'cwm.products.sku.pack',
    defaultMessage: 'SKU包装',
  },
  perSKUQty: {
    id: 'cwm.products.sku.per.qty',
    defaultMessage: '每SKU包装数量',
  },
  length: {
    id: 'cwm.products.sku.length',
    defaultMessage: '长',
  },
  width: {
    id: 'cwm.products.sku.width',
    defaultMessage: '宽',
  },
  height: {
    id: 'cwm.products.sku.height',
    defaultMessage: '高',
  },
  unitCBM: {
    id: 'cwm.products.sku.unit.cbm',
    defaultMessage: '体积',
  },
  grossWeight: {
    id: 'cwm.products.sku.gross.weight',
    defaultMessage: '毛重',
  },
  netWeight: {
    id: 'cwm.products.sku.net.weight',
    defaultMessage: '净重',
  },
  tareWeight: {
    id: 'cwm.products.sku.tare.weight',
    defaultMessage: '皮重',
  },
  lastModifiedDate: {
    id: 'cwm.products.last.modified',
    defaultMessage: '最后更新时间',
  },
  createdDate: {
    id: 'cwm.products.created.date',
    defaultMessage: '创建时间',
  },
  opColumn: {
    id: 'cwm.products.product.opColumn',
    defaultMessage: '操作',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
