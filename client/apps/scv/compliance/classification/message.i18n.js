import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  classification: {
    id: 'scv.compliance',
    defaultMessage: '商品归类',
  },
  hscodeInquiry: {
    id: 'scv.compliance.hscode.inquiry',
    defaultMessage: 'HS编码查询',
  },
  tradeItemMaster: {
    id: 'scv.compliance.tradeitem.master',
    defaultMessage: '物料归类库',
  },
  filterUnclassified: {
    id: 'scv.compliance.tradeitem.filter.unclassified',
    defaultMessage: '未归类',
  },
  filterPending: {
    id: 'scv.compliance.tradeitem.filter.pending',
    defaultMessage: '归类待定',
  },
  filterClassified: {
    id: 'scv.compliance.tradeitem.filter.classified',
    defaultMessage: '已归类',
  },
  filterConflict: {
    id: 'scv.compliance.tradeitem.filter.conflict',
    defaultMessage: '归类冲突',
  },
  copProductNo: {
    id: 'scv.compliance.tradeitem.table.cop.product.no',
    defaultMessage: '商品货号',
  },
  contributed: {
    id: 'scv.compliance.tradeitem.table.contributed',
    defaultMessage: '归类来源',
  },
  hscode: {
    id: 'scv.compliance.tradeitem.table.hscode',
    defaultMessage: '商品编码',
  },
  preHscode: {
    id: 'scv.compliance.tradeitem.modal.table.prehscode',
    defaultMessage: '商品编码(已有)',
  },
  gName: {
    id: 'scv.compliance.tradeitem.g.name',
    defaultMessage: '中文品名',
  },
  enName: {
    id: 'scv.compliance.tradeitem.en.name',
    defaultMessage: '英文描述',
  },
  gModel: {
    id: 'scv.compliance.tradeitem.table.gmodel',
    defaultMessage: '中文规格型号',
  },
  preGModel: {
    id: 'scv.compliance.tradeitem.modal.table.pregmodel',
    defaultMessage: '中文规格型号(已有)',
  },
  element: {
    id: 'scv.compliance.tradeitem.table.element',
    defaultMessage: '申报要素',
  },
  gUnit1: {
    id: 'scv.compliance.tradeitem.table.g.unit1',
    defaultMessage: '申报单位一',
  },
  gUnit2: {
    id: 'scv.compliance.tradeitem.table.g.unit2',
    defaultMessage: '申报单位二',
  },
  gUnit3: {
    id: 'scv.compliance.tradeitem.table.g.unit3',
    defaultMessage: '申报单位三',
  },
  unit1: {
    id: 'scv.compliance.tradeitem.table.unit1',
    defaultMessage: '法一计量单位',
  },
  unit2: {
    id: 'scv.compliance.tradeitem.table.unit2',
    defaultMessage: '法二计量单位',
  },
  fixedQty: {
    id: 'scv.compliance.tradeitem.fixed.qty',
    defaultMessage: '固定值',
  },
  fixedUnit: {
    id: 'scv.compliance.tradeitem.fixed.unit',
    defaultMessage: '固值单位',
  },
  origCountry: {
    id: 'scv.compliance.tradeitem.table.origin.country',
    defaultMessage: '产销国',
  },
  unitNetWt: {
    id: 'scv.compliance.tradeitem.table.unit.netwt',
    defaultMessage: '单个净重',
  },
  grosswt: {
    id: 'scv.compliance.tradeitem.table.gross.wt',
    defaultMessage: '毛重',
  },
  netwt: {
    id: 'scv.compliance.tradeitem.table.net.wt',
    defaultMessage: '净重',
  },
  customsControl: {
    id: 'scv.compliance.tradeitem.table.customs.control',
    defaultMessage: '海关监管条件',
  },
  inspQuarantine: {
    id: 'scv.compliance.tradeitem.table.inspection.quarantine',
    defaultMessage: '商检检验检疫',
  },
  unitPrice: {
    id: 'scv.compliance.tradeitem.table.unit.price',
    defaultMessage: '单价',
  },
  currency: {
    id: 'scv.compliance.tradeitem.table.currency',
    defaultMessage: '币制',
  },
  preClassifyNo: {
    id: 'scv.compliance.tradeitem.table.pre.classify.no',
    defaultMessage: '预归类编号',
  },
  preClassifyStartDate: {
    id: 'scv.compliance.tradeitem.table.pre.classify.start.date',
    defaultMessage: '预归类日期',
  },
  preClassifyEndDate: {
    id: 'scv.compliance.tradeitem.table.pre.classify.end.date',
    defaultMessage: '到期日期',
  },
  remark: {
    id: 'scv.compliance.tradeitem.table.remark',
    defaultMessage: '备注',
  },
  addRepo: {
    id: 'scv.compliance.tradeitem.modal.add.owner',
    defaultMessage: '添加企业物料库',
  },
  addItem: {
    id: 'scv.compliance.tradeitem.table.add',
    defaultMessage: '添加物料',
  },
  importItems: {
    id: 'scv.compliance.tradeitem.items.import',
    defaultMessage: '对比导入',
  },
  importHsunit: {
    id: 'scv.compliance.hscode.gunit.import',
    defaultMessage: '导入申报单位',
  },
  tradeCode: {
    id: 'scv.compliance.tradeitem.tabpane.cop.code',
    defaultMessage: '单位代码',
  },
  compCode: {
    id: 'scv.compliance.tradeitem.tabpane.comp.code',
    defaultMessage: '信用代码',
  },
  customsCode: {
    id: 'scv.compliance.tradeitem.tabpane.customs.code',
    defaultMessage: '海关编码',
  },
  tradeName: {
    id: 'scv.compliance.tradeitem.tabpane.cop.name',
    defaultMessage: '企业名称',
  },
  opColumn: {
    id: 'scv.compliance.tradeitem.column.operation',
    defaultMessage: '操作',
  },
  delete: {
    id: 'scv.compliance.tradeitem.delete',
    defaultMessage: '删除',
  },
  cancel: {
    id: 'scv.compliance.tradeitem.cancel',
    defaultMessage: '取消',
  },
  save: {
    id: 'scv.compliance.tradeitem.save',
    defaultMessage: '保存',
  },
  modify: {
    id: 'scv.compliance.tradeitem.modify',
    defaultMessage: '修改',
  },
  deleteConfirm: {
    id: 'scv.compliance.tradeitem.delete.confirm',
    defaultMessage: '确定删除?',
  },
  newItem: {
    id: 'scv.compliance.tradeitem.new.item',
    defaultMessage: '新增物料',
  },
  editItem: {
    id: 'scv.compliance.tradeitem.edit.item',
    defaultMessage: '修改物料',
  },
  declareWay: {
    id: 'scv.compliance.tradeitem.declare.way',
    defaultMessage: '报关类型',
  },
  declareUnit: {
    id: 'scv.compliance.tradeitem.declare.unit',
    defaultMessage: '申报单位',
  },
  declunitName: {
    id: 'scv.compliance.tradeitem.declunit.name',
    defaultMessage: '申报单位分类名称',
  },
  declunitCode: {
    id: 'scv.compliance.tradeitem.declunit.code',
    defaultMessage: '申报单位代码',
  },
  status: {
    id: 'scv.compliance.tradeitem.status',
    defaultMessage: '状态',
  },
  pass: {
    id: 'scv.compliance.tradeitem.pass',
    defaultMessage: '通过',
  },
  refuse: {
    id: 'scv.compliance.tradeitem.refuse',
    defaultMessage: '拒绝',
  },
  setStandard: {
    id: 'scv.compliance.tradeitem.set.standard',
    defaultMessage: '设为标准',
  },
  broker: {
    id: 'scv.compliance.tradeitem.broker',
    defaultMessage: '报关行',
  },
  nominatedBroker: {
    id: 'scv.compliance.tradeitem.nominated.broker',
    defaultMessage: '指定报关行',
  },
  nonNominatedBroker: {
    id: 'scv.compliance.tradeitem.non.nominated.broker',
    defaultMessage: '不指定报关行',
  },
  reason: {
    id: 'scv.compliance.tradeitem.reason',
    defaultMessage: '原因',
  },
  classifyShareScope: {
    id: 'scv.compliance.slave.share.scope',
    defaultMessage: '共享范围',
  },
  classifySourceRepo: {
    id: 'scv.compliance.slave.source.repo',
    defaultMessage: '来源物料集',
  },
  classifyAudit: {
    id: 'scv.compliance.slave.audit',
    defaultMessage: '审核方式',
  },
  addSlave: {
    id: 'scv.compliance.slave.add',
    defaultMessage: '添加从库',
  },
  complianceTradeItem: {
    id: 'scv.compliance.trade.item',
    defaultMessage: '物料归类库',
  },
  exportUnclassified: {
    id: 'scv.compliance.tradeitem.export.unclassified',
    defaultMessage: '导出未归类物料',
  },
  masterConfig: {
    id: 'scv.classification.master.config',
    defaultMessage: '主库配置',
  },
  slaveConfig: {
    id: 'scv.classification.slave.config',
    defaultMessage: '从库同步',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
