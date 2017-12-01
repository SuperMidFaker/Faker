import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  tradeitem: {
    id: 'cms.tradeitem',
    defaultMessage: '物料归类',
  },
  repoList: {
    id: 'cms.tradeitem.repo.list',
    defaultMessage: '物料库列表',
  },
  taskWorkspace: {
    id: 'cms.tradeitem.task.workspace',
    defaultMessage: '归类工作区',
  },
  createTask: {
    id: 'cms.tradeitem.task.create',
    defaultMessage: '新建归类任务',
  },
  taskUnclassified: {
    id: 'cms.tradeitem.task.unclassified',
    defaultMessage: '未归类新料',
  },
  taskConflict: {
    id: 'cms.tradeitem.task.conflict',
    defaultMessage: '归类冲突',
  },
  taskInvalid: {
    id: 'cms.tradeitem.task.invalid',
    defaultMessage: '归类失效',
  },
  taskPending: {
    id: 'cms.tradeitem.task.pending',
    defaultMessage: '待审核',
  },
  hscodeCustoms: {
    id: 'cms.tradeitem.hscode.customs',
    defaultMessage: '海关税则',
  },
  hscodeQuery: {
    id: 'cms.tradeitem.hscode.query',
    defaultMessage: 'HS编码查询',
  },
  hscodeSpecial: {
    id: 'cms.tradeitem.hscode.special',
    defaultMessage: '特殊HS编码',
  },
  hscodeChanges: {
    id: 'cms.tradeitem.hscode.changes',
    defaultMessage: '税则变更',
  },
  config: {
    id: 'cms.tradeitem.config',
    defaultMessage: '资源配置',
  },
  audit: {
    id: 'cms.tradeitem.audit',
    defaultMessage: '日志审计',
  },
  entrySearchPlaceholder: {
    id: 'cms.supervision.shftz.entry.search.placeholder',
    defaultMessage: 'ASN编号/报关单号/进区凭单号',
  },
  releaseSearchPlaceholder: {
    id: 'cms.supervision.shftz.release.search.placeholder',
    defaultMessage: 'SO编号/报关单号/海关出库单号',
  },
  normalSearchPlaceholder: {
    id: 'cms.supervision.shftz.normal.search.placeholder',
    defaultMessage: '委托单号',
  },
  batchSearchPlaceholder: {
    id: 'cms.supervision.shftz.batch.search.placeholder',
    defaultMessage: '报关单号/申请单号',
  },
  ownerSearchPlaceholder: {
    id: 'cms.supervision.shftz.owner.search.placeholder',
    defaultMessage: '货主海关编码/货主名称',
  },
  productSearchPlaceholder: {
    id: 'cms.supervision.shftz.product.cargo.search.placeholder',
    defaultMessage: '产品货号/产品SKU/原始备件号',
  },
  productNo: {
    id: 'cms.tradeitem.cargo.product.no',
    defaultMessage: '产品货号',
  },
  productSku: {
    id: 'cms.tradeitem.cargo.product.sku',
    defaultMessage: '产品SKU',
  },
  ftzCargoNo: {
    id: 'cms.tradeitem.cargo.orig.no',
    defaultMessage: '备案料号',
  },
  gname: {
    id: 'cms.tradeitem.cargo.gname',
    defaultMessage: '品名',
  },
  unit: {
    id: 'cms.tradeitem.cargo.unit',
    defaultMessage: '单位',
  },
  country: {
    id: 'cms.tradeitem.cargo.country',
    defaultMessage: '国别',
  },
  currency: {
    id: 'cms.tradeitem.cargo.currency',
    defaultMessage: '币制',
  },
  cargoType: {
    id: 'cms.tradeitem.cargo.type',
    defaultMessage: '货物类型',
  },
  opColumn: {
    id: 'cms.tradeitem.opColumn',
    defaultMessage: '操作',
  },
  addRepo: {
    id: 'cms.tradeitem.repo.add',
    defaultMessage: '新增物料库',
  },
  create: {
    id: 'cms.tradeitem.create',
    defaultMessage: '新建',
  },
  manageItems: {
    id: 'cms.tradeitem.repo.manage.items',
    defaultMessage: '料件管理',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
