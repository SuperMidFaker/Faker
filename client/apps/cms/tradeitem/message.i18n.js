import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  tradeitem: {
    id: 'cms.tradeitem',
    defaultMessage: '商品归类',
  },
  repoList: {
    id: 'cms.tradeitem.repo.list',
    defaultMessage: '归类库列表',
  },
  repoOwner: {
    id: 'cms.tradeitem.repo.owner',
    defaultMessage: '所属企业',
  },
  repoCreator: {
    id: 'cms.tradeitem.repo.creator',
    defaultMessage: '创建企业',
  },
  workspace: {
    id: 'cms.tradeitem.workspace',
    defaultMessage: '归类工作区',
  },
  taskList: {
    id: 'cms.tradeitem.workspace.task.list',
    defaultMessage: '导入任务列表',
  },
  taskNew: {
    id: 'cms.tradeitem.workspace.new',
    defaultMessage: '新商品归类',
  },
  taskConflict: {
    id: 'cms.tradeitem.workspace.conflict',
    defaultMessage: '归类冲突',
  },
  taskInvalid: {
    id: 'cms.tradeitem.workspace.invalid',
    defaultMessage: '归类失效',
  },
  taskReview: {
    id: 'cms.tradeitem.workspace.review',
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
  importHscodeItems: {
    id: 'cms.tradeitem.hscodeitems.import',
    defaultMessage: '对比导入',
  },
  importHsunit: {
    id: 'cms.tradeitem.hscode.gunit.import',
    defaultMessage: '导入申报单位',
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
  tradeItemMaster: {
    id: 'cms.tradeitem.master',
    defaultMessage: '主数据',
  },
  tradeItemBranch: {
    id: 'cms.tradeitem.branch',
    defaultMessage: '分支版本',
  },
  tradeItemHistory: {
    id: 'cms.tradeitem.history',
    defaultMessage: '历史版本',
  },
  tradeItemHistoryAll: {
    id: 'cms.tradeitem.history.all',
    defaultMessage: '全部',
  },
  tradeItemHistoryVersioned: {
    id: 'cms.tradeitem.history.versioned',
    defaultMessage: '可用',
  },
  tradeItemHistoryDisabled: {
    id: 'cms.tradeitem.history.disabled',
    defaultMessage: '禁用',
  },
  addItem: {
    id: 'cms.classificagtion.tradeitem.add.item',
    defaultMessage: '新增商品归类',
  },
  editItem: {
    id: 'cms.classificagtion.tradeitem.edit.item',
    defaultMessage: '修改商品归类',
  },
  searchRepoPlaceholder: {
    id: 'cms.tradeitem.searchRepoPlaceholder',
    defaultMessage: '输入客户名称搜索',
  },
  filterUnclassified: {
    id: 'cms.tradeitem.filter.unclassified',
    defaultMessage: '未归类',
  },
  filterPending: {
    id: 'cms.tradeitem.filter.pending',
    defaultMessage: '归类待定',
  },
  filterClassified: {
    id: 'cms.tradeitem.filter.classified',
    defaultMessage: '已归类',
  },
  tabClassification: {
    id: 'cms.tradeitem.tab.classification',
    defaultMessage: '归类信息',
  },
  tabPermit: {
    id: 'cms.tradeitem.tab.permit',
    defaultMessage: '许可证件',
  },
  tabHistory: {
    id: 'cms.tradeitem.tab.history',
    defaultMessage: '历史记录',
  },
  linkSlave: {
    id: 'cms.tradeitem.model.slave.link',
    defaultMessage: '添加关联从库',
  },
  authUserName: {
    id: 'cms.tradeitem.modal.auth.username',
    defaultMessage: '企业名称',
  },
  copProductNo: {
    id: 'cms.tradeitem.col.cop.product.no',
    defaultMessage: '商品货号',
  },
  srcProductNo: {
    id: 'cms.tradeitem.col.src.product.no',
    defaultMessage: '分支标识',
  },
  itemType: {
    id: 'cms.tradeitem.col.item.type',
    defaultMessage: '类型',
  },
  copCode: {
    id: 'cms.tradeitem.col.cop.code',
    defaultMessage: '内部代码',
  },
  copBU: {
    id: 'cms.tradeitem.col.cop.bu',
    defaultMessage: '所属BU',
  },
  copItemGroup: {
    id: 'cms.tradeitem.col.cop.itemgroup',
    defaultMessage: '产品大类',
  },
  copBrand: {
    id: 'cms.tradeitem.col.cop.brand',
    defaultMessage: '品牌',
  },
  processingMethod: {
    id: 'cms.tradeitem.col.processing.method',
    defaultMessage: '工艺/原理',
  },
  materialIngredient: {
    id: 'cms.tradeitem.col.material.ingredient',
    defaultMessage: '材质/成分',
  },
  functionality: {
    id: 'cms.tradeitem.col.cop.functionality',
    defaultMessage: '功能',
  },
  usage: {
    id: 'cms.tradeitem.col.cop.usage',
    defaultMessage: '用途',
  },
  markPass: {
    id: 'cms.tradeitem.form.mark.pass',
    defaultMessage: '标记直接通过',
  },
  hscode: {
    id: 'cms.tradeitem.col.hscode',
    defaultMessage: '商品编码',
  },
  gName: {
    id: 'cms.tradeitem.col.g.name',
    defaultMessage: '中文品名',
  },
  confidence: {
    id: 'cms.tradeitem.col.confidence',
    defaultMessage: '归类确信度',
  },
  enName: {
    id: 'cms.tradeitem.col.en.description',
    defaultMessage: '英文描述',
  },
  gModel: {
    id: 'cms.tradeitem.col.gmodel',
    defaultMessage: '规范申报要素',
  },
  preHscode: {
    id: 'cms.tradeitem.col.prehscode',
    defaultMessage: '原商品编码',
  },
  preGName: {
    id: 'cms.tradeitem.col.pregname',
    defaultMessage: '原中文品名',
  },
  preGModel: {
    id: 'cms.tradeitem.col.pregmodel',
    defaultMessage: '原规范申报要素',
  },
  element: {
    id: 'cms.tradeitem.col.element',
    defaultMessage: '申报要素',
  },
  gUnit1: {
    id: 'cms.tradeitem.col.g.unit1',
    defaultMessage: '申报单位一',
  },
  gUnit2: {
    id: 'cms.tradeitem.col.g.unit2',
    defaultMessage: '申报单位二',
  },
  gUnit3: {
    id: 'cms.tradeitem.col.g.unit3',
    defaultMessage: '申报单位三',
  },
  unit1: {
    id: 'cms.tradeitem.col.unit1',
    defaultMessage: '法一计量单位',
  },
  unit2: {
    id: 'cms.tradeitem.col.unit2',
    defaultMessage: '法二计量单位',
  },
  fixedQty: {
    id: 'cms.tradeitem.fixed.qty',
    defaultMessage: '固定值',
  },
  fixedUnit: {
    id: 'cms.tradeitem.fixed.unit',
    defaultMessage: '固值单位',
  },
  origCountry: {
    id: 'cms.tradeitem.col.origin.country',
    defaultMessage: '产销国',
  },
  specialNo: {
    id: 'cms.tradeitem.col.special.no',
    defaultMessage: '特殊货号合并',
  },
  unitNetWt: {
    id: 'cms.tradeitem.col.unit.netwt',
    defaultMessage: '单个净重',
  },
  grosswt: {
    id: 'cms.tradeitem.col.gross.wt',
    defaultMessage: '毛重',
  },
  netwt: {
    id: 'cms.tradeitem.col.net.wt',
    defaultMessage: '净重',
  },
  customsControl: {
    id: 'cms.tradeitem.col.customs.control',
    defaultMessage: '海关监管条件',
  },
  inspQuarantine: {
    id: 'cms.tradeitem.col.inspection.quarantine',
    defaultMessage: '检验检疫',
  },
  unitPrice: {
    id: 'cms.tradeitem.col.unit.price',
    defaultMessage: '单价',
  },
  currency: {
    id: 'cms.tradeitem.col.currency',
    defaultMessage: '币制',
  },
  customsPermit: {
    id: 'cms.tradeitem.customs.permit',
    defaultMessage: '海关监管条件',
  },
  ciqPermit: {
    id: 'cms.tradeitem.ciq.permit',
    defaultMessage: '检验检疫条件',
  },
  applCertCode: {
    id: 'cms.tradeitem.appl.certcode',
    defaultMessage: '商检出具证书',
  },
  preClassifyNo: {
    id: 'cms.tradeitem.col.pre.classify.no',
    defaultMessage: '预归类编号',
  },
  preClassifyStartDate: {
    id: 'cms.tradeitem.col.pre.classify.start.date',
    defaultMessage: '预归类日期',
  },
  preClassifyEndDate: {
    id: 'cms.tradeitem.col.pre.classify.end.date',
    defaultMessage: '到期日期',
  },
  remark: {
    id: 'cms.tradeitem.col.remark',
    defaultMessage: '备注',
  },
  specialSplit: {
    id: 'cms.tradeitem.special.split',
    defaultMessage: '独立拆分',
  },
  specialMerge: {
    id: 'cms.tradeitem.special.merge',
    defaultMessage: '货号合并',
  },
  opColumn: {
    id: 'cms.tradeitem.opColumn',
    defaultMessage: '操作',
  },
  addRepo: {
    id: 'cms.tradeitem.repo.add',
    defaultMessage: '新增归类库',
  },
  create: {
    id: 'cms.tradeitem.create',
    defaultMessage: '新建',
  },
  manageData: {
    id: 'cms.tradeitem.repo.manage.data',
    defaultMessage: '数据管理',
  },
  createdDate: {
    id: 'cms.tradeitem.created.date',
    defaultMessage: '创建时间',
  },
  createdBy: {
    id: 'cms.tradeitem.created.by',
    defaultMessage: '创建人',
  },
  newComparisonImport: {
    id: 'cms.tradeitem.task.new.comparison.import',
    defaultMessage: '新建对比导入',
  },
  pass: {
    id: 'cms.tradeitem.pendig.pass',
    defaultMessage: '通过',
  },
  refuse: {
    id: 'cms.tradeitem.pending.refuse',
    defaultMessage: '拒绝',
  },
  modify: {
    id: 'cms.tradeitem.op.modify',
    defaultMessage: '修改',
  },
  diff: {
    id: 'cms.tradeitem.op.diff',
    defaultMessage: '对比',
  },
  forkItem: {
    id: 'cms.tradeitem.op.fork',
    defaultMessage: '建立归类分支',
  },
  delete: {
    id: 'cms.tradeitem.op.delete',
    defaultMessage: '删除',
  },
  cancel: {
    id: 'cms.tradeitem.op.cancel',
    defaultMessage: '取消',
  },
  save: {
    id: 'cms.tradeitem.op.save',
    defaultMessage: '保存',
  },
  deleteConfirm: {
    id: 'cms.tradeitem.op.delete.confirm',
    defaultMessage: '确定删除？',
  },
  exportAllClassify: {
    id: 'cms.tradeitem.op.export.allclassify',
    defaultMessage: '导出归类数据',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
