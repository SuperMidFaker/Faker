import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  products: {
    id: 'cwm.products',
    defaultMessage: '货品',
  },
  productsSku: {
    id: 'cwm.products.sku',
    defaultMessage: 'SKU',
  },
  productImport: {
    id: 'cwm.products.import',
    defaultMessage: '货品',
  },
  createSKU: {
    id: 'cwm.products.sku.create',
    defaultMessage: '新建货品',
  },
  productSearchPlaceholder: {
    id: 'cwm.products.search.placeholder',
    defaultMessage: 'SKU号或者货号',
  },
  ownerSearch: {
    id: 'cwm.products.owner.search',
    defaultMessage: '货主名称或编号',
  },
  productNo: {
    id: 'cwm.products.productno',
    defaultMessage: '货号',
  },
  productCnDesc: {
    id: 'cwm.products.sku.cn.desc',
    defaultMessage: '中文名',
  },
  productEnDesc: {
    id: 'cwm.products.sku.en.desc',
    defaultMessage: '英文名',
  },
  productCategory: {
    id: 'cwm.products.product.category',
    defaultMessage: '种类',
  },
  productType: {
    id: 'cwm.products.product.type',
    defaultMessage: '商品类型',
  },
  opColumn: {
    id: 'cwm.products.product.opColumn',
    defaultMessage: '操作',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
