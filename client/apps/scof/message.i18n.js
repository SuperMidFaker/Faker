import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  dashboard: {
    id: 'sof.module.dashboard',
    defaultMessage: '工作台',
  },
  shipments: {
    id: 'sof.module.shipments',
    defaultMessage: '货运订单',
  },
  invoices: {
    id: 'sof.module.invoices',
    defaultMessage: '商业发票',
  },
  purchaseOrders: {
    id: 'sof.module.purchase.orders',
    defaultMessage: '采购订单',
  },
  tracking: {
    id: 'sof.module.tracking',
    defaultMessage: '追踪报表',
  },
  customizeTracking: {
    id: 'sof.module.tracking.customize',
    defaultMessage: '自定义追踪表',
  },
  customers: {
    id: 'sof.module.partner.customers',
    defaultMessage: '客户',
  },
  suppliers: {
    id: 'sof.module.partner.suppliers',
    defaultMessage: '供应商',
  },
  vendors: {
    id: 'sof.module.partner.vendors',
    defaultMessage: '服务商',
  },
  flow: {
    id: 'sof.module.flow',
    defaultMessage: '流程',
  },
  settings: {
    id: 'sof.module.settings',
    defaultMessage: '设置',
  },
  devApps: {
    id: 'sof.module.dev.apps',
    defaultMessage: '更多应用',
  },
  partnerSearchPlaceholder: {
    id: 'sof.partner.search.placeholder',
    defaultMessage: '搜索名称/代码/海关编码/统一信用代码',
  },
  customerName: {
    id: 'sof.customers.name',
    defaultMessage: '客户名称',
  },
  customerCode: {
    id: 'sof.customers.code',
    defaultMessage: '客户代码',
  },
  serviceTeam: {
    id: 'sof.customers.service.team',
    defaultMessage: '服务团队',
  },
  batchImportCustomers: {
    id: 'sof.customers.batch.import',
    defaultMessage: '批量导入客户',
  },
  supplierName: {
    id: 'sof.supplier.name',
    defaultMessage: '供应商名称',
  },
  supplierCode: {
    id: 'sof.supplier.code',
    defaultMessage: '供应商代码',
  },
  batchImportSuppliers: {
    id: 'sof.supplier.batch.import',
    defaultMessage: '批量导入供应商',
  },
  vendorName: {
    id: 'sof.vendors.name',
    defaultMessage: '服务商名称',
  },
  vendorCode: {
    id: 'sof.vendors.code',
    defaultMessage: '服务商代码',
  },
  batchImportVendors: {
    id: 'sof.vendors.batch.import',
    defaultMessage: '批量导入服务商',
  },
  displayName: {
    id: 'sof.partner.display.name',
    defaultMessage: '显示名称',
  },
  englishName: {
    id: 'sof.partner.english.name',
    defaultMessage: '英文名称',
  },
  profile: {
    id: 'sof.partner.profile',
    defaultMessage: '资料',
  },
  businessType: {
    id: 'sof.partner.business.type',
    defaultMessage: '业务类型',
  },
  contact: {
    id: 'sof.partner.contact',
    defaultMessage: '联系人',
  },
  phone: {
    id: 'sof.partner.phone',
    defaultMessage: '电话',
  },
  email: {
    id: 'sof.partner.email',
    defaultMessage: '邮箱',
  },
  country: {
    id: 'sof.partner.country',
    defaultMessage: '国家',
  },
  uscCode: {
    id: 'sof.partner.usccode',
    defaultMessage: '统一社会信用代码',
  },
  customsCode: {
    id: 'sof.partner.customs.code',
    defaultMessage: '海关编码',
  },
  internalId: {
    id: 'sof.partner.id',
    defaultMessage: '合作ID',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
