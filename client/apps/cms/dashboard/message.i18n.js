import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'cms.dashboard',
    defaultMessage: '工作台',
  },
  stats: {
    id: 'cms.dashboard.stats',
    defaultMessage: '业务统计',
  },
  total: {
    id: 'cms.dashboard.stats.total',
    defaultMessage: '总票数',
  },
  sumImport: {
    id: 'cms.dashboard.stats.sum.import',
    defaultMessage: '进口/进境',
  },
  sumExport: {
    id: 'cms.dashboard.stats.sum.export',
    defaultMessage: '出口/出境',
  },
  processing: {
    id: 'cms.dashboard.stats.status.processing',
    defaultMessage: '制单',
  },
  declared: {
    id: 'cms.dashboard.stats.status.declared',
    defaultMessage: '申报',
  },
  released: {
    id: 'cms.dashboard.stats.status.released',
    defaultMessage: '放行',
  },
  inspected: {
    id: 'cms.dashboard.stats.status.inspected',
    defaultMessage: '查验',
  },
  inspectedRate: {
    id: 'cms.dashboard.stats.status.inspected.rate',
    defaultMessage: '查验率',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
