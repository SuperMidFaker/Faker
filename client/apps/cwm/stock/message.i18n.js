import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  stock: {
    id: 'cwm.stock',
    defaultMessage: '库存',
  },
  query: {
    id: 'cwm.stock.query',
    defaultMessage: '库存查询',
  },
  inquiry: {
    id: 'cwm.stock.action.inquiry',
    defaultMessage: '查询',
  },
  export: {
    id: 'cwm.stock.action.export',
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
  inboundDate: {
    id: 'cwm.stock.inbound.date',
    defaultMessage: '入库日期',
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
  bondedQty: {
    id: 'cwm.stock.bonded.qty',
    defaultMessage: '保税数量',
  },
  nonbondedQty: {
    id: 'cwm.stock.nonbonded.qty',
    defaultMessage: '非保税数量',
  },
  grossWeight: {
    id: 'cwm.stock.gross.weight',
    defaultMessage: '毛重',
  },
  cbm: {
    id: 'cwm.stock.cbm',
    defaultMessage: '体积',
  },
  traceId: {
    id: 'cwm.stock.trace.id',
    defaultMessage: '追踪ID',
  },
  lotNo: {
    id: 'cwm.stock.lot.no',
    defaultMessage: '批次号',
  },
  virtualWhse: {
    id: 'cwm.stock.virtual.whse',
    defaultMessage: '库别',
  },
  bonded: {
    id: 'cwm.stock.bonded',
    defaultMessage: '保税',
  },
  portion: {
    id: 'cwm.stock.portion',
    defaultMessage: '分拨',
  },
  damageLevel: {
    id: 'cwm.stock.damage.level',
    defaultMessage: '包装情况',
  },
  expiryDate: {
    id: 'cwm.stock.expiry.date',
    defaultMessage: '过期日期',
  },
  ftzEntryId: {
    id: 'cwm.stock.ftz.entry.id',
    defaultMessage: '入库明细ID',
  },
  movement: {
    id: 'cwm.stock.movement',
    defaultMessage: '移库单',
  },
  createMovement: {
    id: 'cwm.stock.movement.create',
    defaultMessage: '创建移库单',
  },
});

export default messages;

export const formatMsg = formati18n(messages);
