import { defineMessages } from 'react-intl';

const messages = defineMessages({
  classification: {
    id: 'cms.classificagtion',
    defaultMessage: '商品归类',
  },
  hscodeInquiry: {
    id: 'cms.classificagtion.hscode.inquiry',
    defaultMessage: 'HS编码查询',
  },
  tradeItemMaster: {
    id: 'cms.classificagtion.tradeitem.master',
    defaultMessage: '企业物料库',
  },
  searchRepoPlaceholder: {
    id: 'cms.classificagtion.tradeitem.searchRepoPlaceholder',
    defaultMessage: '输入客户名称搜索',
  },
  filterUnclassified: {
    id: 'cms.classificagtion.tradeitem.filter.unclassified',
    defaultMessage: '未归类',
  },
  filterPending: {
    id: 'cms.classificagtion.tradeitem.filter.pending',
    defaultMessage: '归类待定',
  },
  filterClassified: {
    id: 'cms.classificagtion.tradeitem.filter.classified',
    defaultMessage: '已归类',
  },
  stageClassified: {
    id: 'cms.classificagtion.tradeitem.stage.classified',
    defaultMessage: '新来源归类区',
  },
  copProductNo: {
    id: 'cms.classificagtion.tradeitem.table.cop.product.no',
    defaultMessage: '商品货号',
  },
  srcProductNo: {
    id: 'cms.classificagtion.tradeitem.table.src.product.no',
    defaultMessage: '源标识',
  },
  hscode: {
    id: 'cms.classificagtion.tradeitem.table.hscode',
    defaultMessage: '商品编码',
  },
  preHscode: {
    id: 'cms.classificagtion.tradeitem.modal.table.prehscode',
    defaultMessage: '商品编码(已有)',
  },
  gName: {
    id: 'cms.classificagtion.tradeitem.g.name',
    defaultMessage: '中文品名',
  },
  preGname: {
    id: 'cms.classificagtion.tradeitem.pre.gname',
    defaultMessage: '中文品名(已有)',
  },
  enName: {
    id: 'cms.classificagtion.tradeitem.en.description',
    defaultMessage: '英文描述',
  },
  specialNo: {
    id: 'cms.classificagtion.tradeitem.special.no',
    defaultMessage: '特殊货号合并',
  },
  gModel: {
    id: 'cms.classificagtion.tradeitem.table.gmodel',
    defaultMessage: '中文规格型号',
  },
  preGModel: {
    id: 'cms.classificagtion.tradeitem.modal.table.pregmodel',
    defaultMessage: '中文规格型号(已有)',
  },
  element: {
    id: 'cms.classificagtion.tradeitem.table.element',
    defaultMessage: '申报要素',
  },
  gUnit1: {
    id: 'cms.classificagtion.tradeitem.table.g.unit1',
    defaultMessage: '申报单位一',
  },
  gUnit2: {
    id: 'cms.classificagtion.tradeitem.table.g.unit2',
    defaultMessage: '申报单位二',
  },
  gUnit3: {
    id: 'cms.classificagtion.tradeitem.table.g.unit3',
    defaultMessage: '申报单位三',
  },
  unit1: {
    id: 'cms.classificagtion.tradeitem.table.unit1',
    defaultMessage: '法一计量单位',
  },
  unit2: {
    id: 'cms.classificagtion.tradeitem.table.unit2',
    defaultMessage: '法二计量单位',
  },
  fixedQty: {
    id: 'cms.classificagtion.tradeitem.fixed.qty',
    defaultMessage: '固定值',
  },
  fixedUnit: {
    id: 'cms.classificagtion.tradeitem.fixed.unit',
    defaultMessage: '固值单位',
  },
  origCountry: {
    id: 'cms.classificagtion.tradeitem.table.origin.country',
    defaultMessage: '产销国',
  },
  unitNetWt: {
    id: 'cms.classificagtion.tradeitem.table.unit.netwt',
    defaultMessage: '单个净重',
  },
  grosswt: {
    id: 'cms.classificagtion.tradeitem.table.gross.wt',
    defaultMessage: '毛重',
  },
  netwt: {
    id: 'cms.classificagtion.tradeitem.table.net.wt',
    defaultMessage: '净重',
  },
  customsControl: {
    id: 'cms.classificagtion.tradeitem.table.customs.control',
    defaultMessage: '海关监管条件',
  },
  inspQuarantine: {
    id: 'cms.classificagtion.tradeitem.table.inspection.quarantine',
    defaultMessage: '商检检验检疫',
  },
  unitPrice: {
    id: 'cms.classificagtion.tradeitem.table.unit.price',
    defaultMessage: '单价',
  },
  currency: {
    id: 'cms.classificagtion.tradeitem.table.currency',
    defaultMessage: '币制',
  },
  preClassifyNo: {
    id: 'cms.classificagtion.tradeitem.table.pre.classify.no',
    defaultMessage: '预归类编号',
  },
  preClassifyStartDate: {
    id: 'cms.classificagtion.tradeitem.table.pre.classify.start.date',
    defaultMessage: '预归类日期',
  },
  preClassifyEndDate: {
    id: 'cms.classificagtion.tradeitem.table.pre.classify.end.date',
    defaultMessage: '到期日期',
  },
  remark: {
    id: 'cms.classificagtion.tradeitem.table.remark',
    defaultMessage: '备注',
  },
  addRepo: {
    id: 'cms.classificagtion.tradeitem.modal.add.owner',
    defaultMessage: '添加企业物料库',
  },
  repoOwner: {
    id: 'cms.classificagtion.tradeitem.modal.repo.owner',
    defaultMessage: '所属客户',
  },
  addItem: {
    id: 'cms.classificagtion.tradeitem.table.add',
    defaultMessage: '添加物料',
  },
  importItems: {
    id: 'cms.classificagtion.tradeitem.items.import',
    defaultMessage: '对比导入',
  },
  importHsunit: {
    id: 'cms.classificagtion.hscode.gunit.import',
    defaultMessage: '导入申报单位',
  },
  tradeCode: {
    id: 'cms.classificagtion.tradeitem.tabpane.cop.code',
    defaultMessage: '单位代码',
  },
  compCode: {
    id: 'cms.classificagtion.tradeitem.tabpane.comp.code',
    defaultMessage: '信用代码',
  },
  customsCode: {
    id: 'cms.classificagtion.tradeitem.tabpane.customs.code',
    defaultMessage: '海关编码',
  },
  tradeName: {
    id: 'cms.classificagtion.tradeitem.tabpane.cop.name',
    defaultMessage: '企业名称',
  },
  opColumn: {
    id: 'cms.classificagtion.tradeitem.column.operation',
    defaultMessage: '操作',
  },
  delete: {
    id: 'cms.classificagtion.tradeitem.delete',
    defaultMessage: '删除',
  },
  cancel: {
    id: 'cms.classificagtion.tradeitem.cancel',
    defaultMessage: '取消',
  },
  save: {
    id: 'cms.classificagtion.tradeitem.save',
    defaultMessage: '保存',
  },
  modify: {
    id: 'cms.classificagtion.tradeitem.modify',
    defaultMessage: '修改',
  },
  deleteConfirm: {
    id: 'cms.classificagtion.tradeitem.delete.confirm',
    defaultMessage: '确认删除?',
  },
  newItem: {
    id: 'cms.classificagtion.tradeitem.new.item',
    defaultMessage: '新增物料',
  },
  editItem: {
    id: 'cms.classificagtion.tradeitem.edit.item',
    defaultMessage: '修改物料',
  },
  declareWay: {
    id: 'cms.classificagtion.tradeitem.declare.way',
    defaultMessage: '报关类型',
  },
  declareUnit: {
    id: 'cms.classificagtion.tradeitem.declare.unit',
    defaultMessage: '申报单位',
  },
  declunitName: {
    id: 'cms.classificagtion.tradeitem.declunit.name',
    defaultMessage: '申报单位分类名称',
  },
  declunitCode: {
    id: 'cms.classificagtion.tradeitem.declunit.code',
    defaultMessage: '申报单位代码',
  },
  status: {
    id: 'cms.classificagtion.tradeitem.status',
    defaultMessage: '状态',
  },
  pass: {
    id: 'cms.classificagtion.tradeitem.pass',
    defaultMessage: '通过',
  },
  refuse: {
    id: 'cms.classificagtion.tradeitem.refuse',
    defaultMessage: '拒绝',
  },
  addNewSrc: {
    id: 'cms.classificagtion.tradeitem.add.newSource',
    defaultMessage: '添加新来源',
  },
  copyToStage: {
    id: 'cms.classificagtion.tradeitem.copy.stage',
    defaultMessage: '复制到自留区',
  },
  exportUnclassified: {
    id: 'cms.classificagtion.tradeitem.export.unclassified',
    defaultMessage: '导出未归类物料',
  },
  spcialSearchPh: {
    id: 'cms.classificagtion.tradeitem.special.search',
    defaultMessage: '分类名称',
  },
  specialSplit: {
    id: 'cms.classificagtion.tradeitem.special.split',
    defaultMessage: '独立拆分',
  },
  specialMerge: {
    id: 'cms.classificagtion.tradeitem.special.merge',
    defaultMessage: '货号合并',
  },
});
export default messages;
