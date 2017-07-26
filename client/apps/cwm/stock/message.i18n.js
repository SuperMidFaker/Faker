import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  stock: {
    id: 'cwm.stock',
    defaultMessage: '库存',
  },
  query: {
    id: 'cwm.stock.query',
    defaultMessage: '查询',
  },
  export: {
    id: 'cwm.stock.export',
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
  location: {
    id: 'cwm.stock.location',
    defaultMessage: '库位',
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
  grossWeight: {
    id: 'cwm.stock.gross.weight',
    defaultMessage: '毛重',
  },
  cbm: {
    id: 'cwm.stock.cbm',
    defaultMessage: '体积',
  },
  movement: {
    id: 'cwm.stock.movement',
    defaultMessage: '库存移动',
  },
  createMovement: {
    id: 'cwm.stock.movement.create',
    defaultMessage: '创建库存移动单',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
