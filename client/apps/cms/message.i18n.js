import { defineMessages } from 'react-intl';

const messages = defineMessages({
  dashboard: {
    id: 'cms.module.dashboard',
    defaultMessage: '工作台',
  },
  delegation: {
    id: 'cms.module.delegation',
    defaultMessage: '委托管理',
  },
  customsDecl: {
    id: 'cms.module.customs.decl',
    defaultMessage: '报关管理',
  },
  ciqDecl: {
    id: 'cms.module.ciq.decl',
    defaultMessage: '报检管理',
  },
  import: {
    id: 'cms.module.import',
    defaultMessage: '进口申报',
  },
  importManifest: {
    id: 'cms.module.import.manifest',
    defaultMessage: '申报清单',
  },
  importCustomsDecl: {
    id: 'cms.module.import.decl.customs',
    defaultMessage: '报关单证',
  },
  importCiqDecl: {
    id: 'cms.module.import.decl.ciq',
    defaultMessage: '报检单证',
  },
  export: {
    id: 'cms.module.export',
    defaultMessage: '出口申报',
  },
  exportManifest: {
    id: 'cms.module.export.manifest',
    defaultMessage: '申报清单',
  },
  exportCustomsDecl: {
    id: 'cms.module.export.decl.customs',
    defaultMessage: '报关单证',
  },
  exportCiqDecl: {
    id: 'cms.module.export.decl.ciq',
    defaultMessage: '报检单证',
  },
  billing: {
    id: 'cms.module.billing',
    defaultMessage: '计费',
  },
  expense: {
    id: 'cms.module.billing.expense',
    defaultMessage: '费用结算',
  },
  billingReceivable: {
    id: 'cms.module.billing.receivable',
    defaultMessage: '应收账单',
  },
  billingPayable: {
    id: 'cms.module.billing.payable',
    defaultMessage: '应付账单',
  },
  quote: {
    id: 'cms.module.resources.quote',
    defaultMessage: '费率设置',
  },
  classification: {
    id: 'cms.module.classification',
    defaultMessage: '商品归类',
  },
  tradeItem: {
    id: 'cms.module.classification.trade.item',
    defaultMessage: '企业物料库',
  },
  hscode: {
    id: 'cms.module.classification.hscode',
    defaultMessage: 'HS编码查询',
  },
  specialCategory: {
    id: 'cms.module.classification.special.category',
    defaultMessage: '特殊商品编码分类',
  },
  analytics: {
    id: 'cms.module.analytics',
    defaultMessage: '报表中心',
  },
  analyticsKPI: {
    id: 'cms.module.analytics.kpi',
    defaultMessage: 'KPI分析',
  },
  settings: {
    id: 'cms.module.settings',
    defaultMessage: '设置',
  },
  resources: {
    id: 'cms.module.settings.resources',
    defaultMessage: '资源设置',
  },
  brokers: {
    id: 'cms.module.settings.brokers',
    defaultMessage: '报关报检代理',
  },
  docTemplates: {
    id: 'cms.module.settings.doc.templates',
    defaultMessage: '单据模板',
  },
  preferences: {
    id: 'cms.module.settings.preferences',
    defaultMessage: '偏好设置',
  },
});
export default messages;
