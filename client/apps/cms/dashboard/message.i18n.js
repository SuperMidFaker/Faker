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
  totalValue: {
    id: 'cms.dashboard.stats.total.value',
    defaultMessage: '总货值',
  },
  sumImport: {
    id: 'cms.dashboard.stats.sum.import',
    defaultMessage: '进口/进境',
  },
  sumImportValue: {
    id: 'cms.dashboard.stats.sum.import.value',
    defaultMessage: '进口货值',
  },
  sumExport: {
    id: 'cms.dashboard.stats.sum.export',
    defaultMessage: '出口/出境',
  },
  sumExportValue: {
    id: 'cms.dashboard.stats.sum.export.value',
    defaultMessage: '出口货值',
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
  classificationStats: {
    id: 'cms.dashboard.stats.classification',
    defaultMessage: '归类统计',
  },
  repoCount: {
    id: 'cms.dashboard.stats.classification.repo.count',
    defaultMessage: '企业归类库',
  },
  classifiedItems: {
    id: 'cms.dashboard.stats.classification.classified.items',
    defaultMessage: '已归类',
  },
  pendingItems: {
    id: 'cms.dashboard.stats.classification.pending.items',
    defaultMessage: '归类待定',
  },
  unclassifiedItems: {
    id: 'cms.dashboard.stats.classification.unclassified.items',
    defaultMessage: '未归类',
  },
  taxStats: {
    id: 'cms.dashboard.stats.tax',
    defaultMessage: '税金统计',
  },
  totalPaid: {
    id: 'cms.dashboard.stats.tax.total.paid',
    defaultMessage: '缴税总额',
  },
  duty: {
    id: 'cms.dashboard.stats.tax.duty',
    defaultMessage: '关税',
  },
  VAT: {
    id: 'cms.dashboard.stats.tax.VAT',
    defaultMessage: '增值税',
  },
  comsuTax: {
    id: 'cms.dashboard.stats.tax.comsuTax',
    defaultMessage: '消费税',
  },
  totalWithdrawn: {
    id: 'cms.dashboard.stats.tax.total.withdrawn',
    defaultMessage: '退税总额',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
