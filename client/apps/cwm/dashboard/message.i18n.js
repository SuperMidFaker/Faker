import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'cwm.dashboard',
    defaultMessage: '工作台',
  },
  stats: {
    id: 'cwm.dashboard.stats',
    defaultMessage: '数据统计',
  },
  inboundStats: {
    id: 'cwm.dashboard.stats.inbound',
    defaultMessage: '入库统计',
  },
  totalInbound: {
    id: 'cwm.dashboard.stats.inbound.total.asn',
    defaultMessage: '入库单量',
  },
  asnPending: {
    id: 'cwm.dashboard.stats.asn.pending',
    defaultMessage: '待释放ASN',
  },
  toReceive: {
    id: 'cwm.dashboard.stats.inbound.to.receive',
    defaultMessage: '待收货',
  },
  toPutAway: {
    id: 'cwm.dashboard.stats.inbound.to.putAway',
    defaultMessage: '待上架',
  },
  inboundCompleted: {
    id: 'cwm.dashboard.stats.inbound.complete',
    defaultMessage: '入库完成',
  },
  outboundStats: {
    id: 'cwm.dashboard.stats.outbound',
    defaultMessage: '入库统计',
  },
  totalOutbound: {
    id: 'cwm.dashboard.stats.outbound.total.so',
    defaultMessage: '出库单量',
  },
  soPending: {
    id: 'cwm.dashboard.stats.so.pending',
    defaultMessage: '待释放SO',
  },
  toAllocate: {
    id: 'cwm.dashboard.stats.outbound.to.allocate',
    defaultMessage: '待分配',
  },
  toPick: {
    id: 'cwm.dashboard.stats.outbound.to.pick',
    defaultMessage: '待拣货',
  },
  toShip: {
    id: 'cwm.dashboard.stats.outbound.to.ship',
    defaultMessage: '待发货',
  },
  outboundCompleted: {
    id: 'cwm.dashboard.stats.outbound.completed',
    defaultMessage: '出库完成',
  },
  tasksTotal: {
    id: 'cwm.dashboard.stats.tasks.total',
    defaultMessage: '总量',
  },
  tasksCompleted: {
    id: 'cwm.dashboard.stats.tasks.completed',
    defaultMessage: '完成量',
  },
  receipts: {
    id: 'cwm.dashboard.stats.tasks.receipts',
    defaultMessage: '收货',
  },
  putaways: {
    id: 'cwm.dashboard.stats.tasks.putaways',
    defaultMessage: '上架',
  },
  pickings: {
    id: 'cwm.dashboard.stats.tasks.pickings',
    defaultMessage: '拣货',
  },
  shipments: {
    id: 'cwm.dashboard.stats.tasks.shipments',
    defaultMessage: '发货',
  },
  replenishments: {
    id: 'cwm.dashboard.stats.tasks.replenishments',
    defaultMessage: '补货',
  },
  bondedStats: {
    id: 'cwm.dashboard.stats.bonded',
    defaultMessage: '保税监管统计',
  },
  entryToSync: {
    id: 'cwm.dashboard.stats.bonded.entryToSync',
    defaultMessage: '进区备案待同步',
  },
  normalToClear: {
    id: 'cwm.dashboard.stats.bonded.normalToClear',
    defaultMessage: '普通出库待清关',
  },
  normalToExit: {
    id: 'cwm.dashboard.stats.bonded.normalToExit',
    defaultMessage: '普通出库待出区',
  },
  portionToSync: {
    id: 'cwm.dashboard.stats.bonded.portionToSync',
    defaultMessage: '分拨出库待同步',
  },
  portionToClear: {
    id: 'cwm.dashboard.stats.bonded.portionToClear',
    defaultMessage: '分拨出库待清关',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
