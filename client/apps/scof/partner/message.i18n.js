import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  customers: {
    id: 'sof.partner.customers',
    defaultMessage: '客户',
  },
  suppliers: {
    id: 'sof.partner.suppliers',
    defaultMessage: '供应商',
  },
  vendors: {
    id: 'sof.partner.vendors',
    defaultMessage: '服务商',
  },
  partnerSearchPlaceholder: {
    id: 'sof.partner.search.placeholder',
    defaultMessage: '搜索名称/代码/海关编码/统一信用代码',
  },
  customerName: {
    id: 'sof.partner.customers.name',
    defaultMessage: '客户名称',
  },
  customerCode: {
    id: 'sof.partner.customers.code',
    defaultMessage: '客户代码',
  },
  serviceTeam: {
    id: 'sof.partner.customers.service.team',
    defaultMessage: '服务团队',
  },
  batchImportCustomers: {
    id: 'sof.partner.customers.batch.import',
    defaultMessage: '批量导入客户',
  },
  supplierName: {
    id: 'sof.partner.supplier.name',
    defaultMessage: '供应商名称',
  },
  supplierCode: {
    id: 'sof.partner.supplier.code',
    defaultMessage: '供应商代码',
  },
  batchImportSuppliers: {
    id: 'sof.partner.supplier.batch.import',
    defaultMessage: '批量导入供应商',
  },
  vendorName: {
    id: 'sof.partner.vendors.name',
    defaultMessage: '服务商名称',
  },
  vendorCode: {
    id: 'sof.partner.vendors.code',
    defaultMessage: '服务商代码',
  },
  batchImportVendors: {
    id: 'sof.partner.vendors.batch.import',
    defaultMessage: '批量导入服务商',
  },
  displayName: {
    id: 'sof.partner.display.name',
    defaultMessage: '企业简称',
  },
  englishName: {
    id: 'sof.partner.english.name',
    defaultMessage: '英文名称',
  },
  profile: {
    id: 'sof.partner.profile',
    defaultMessage: '资料',
  },
  businessInfo: {
    id: 'sof.partner.business.info',
    defaultMessage: '工商信息',
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
    defaultMessage: '国家/地区',
  },
  uscCode: {
    id: 'sof.partner.usc.code',
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
  partnerNameRequired: {
    id: 'sof.partner.name.required',
    defaultMessage: '企业名称必填',
  },
  uscCode18len: {
    id: 'sof.partner.scccode.len18',
    defaultMessage: '18位统一社会信用代码',
  },
  customsCode10len: {
    id: 'sof.partner.customs.code.len10',
    defaultMessage: '10位海关编码',
  },
  qichachaCorpSearch: {
    id: 'sof.partner.qichacha.search',
    defaultMessage: '输入企业名称搜索',
  },
  vendorBusinessTypeRequired: {
    id: 'sof.vendor.busitype.required',
    defaultMessage: '请选择服务商业务类型',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
