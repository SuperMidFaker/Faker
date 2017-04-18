import { defineMessages } from 'react-intl';

const messages = defineMessages({
  classification: {
    id: 'scv.products',
    defaultMessage: '商品归类',
  },
  hscodeInquiry: {
    id: 'scv.products.hscode.inquiry',
    defaultMessage: 'HS编码查询',
  },
  tradeItemMaster: {
    id: 'scv.products.tradeitem.master',
    defaultMessage: '企业物料库',
  },
  filterUnclassified: {
    id: 'scv.products.tradeitem.filter.unclassified',
    defaultMessage: '未归类',
  },
  filterPending: {
    id: 'scv.products.tradeitem.filter.pending',
    defaultMessage: '归类待定',
  },
  filterClassified: {
    id: 'scv.products.tradeitem.filter.classified',
    defaultMessage: '已归类',
  },
  filterConflict: {
    id: 'scv.products.tradeitem.filter.conflict',
    defaultMessage: '归类冲突',
  },
  copProductNo: {
    id: 'scv.products.tradeitem.table.cop.product.no',
    defaultMessage: '商品货号',
  },
  contributed: {
    id: 'scv.products.tradeitem.table.contributed',
    defaultMessage: '归类来源',
  },
  hscode: {
    id: 'scv.products.tradeitem.table.hscode',
    defaultMessage: '商品编码',
  },
  preHscode: {
    id: 'scv.products.tradeitem.modal.table.prehscode',
    defaultMessage: '商品编码(已有)',
  },
  gName: {
    id: 'scv.products.tradeitem.g.name',
    defaultMessage: '中文品名',
  },
  gModel: {
    id: 'scv.products.tradeitem.table.gmodel',
    defaultMessage: '中文规格型号',
  },
  preGModel: {
    id: 'scv.products.tradeitem.modal.table.pregmodel',
    defaultMessage: '中文规格型号(已有)',
  },
  element: {
    id: 'scv.products.tradeitem.table.element',
    defaultMessage: '申报要素',
  },
  gUnit1: {
    id: 'scv.products.tradeitem.table.g.unit1',
    defaultMessage: '申报单位一',
  },
  gUnit2: {
    id: 'scv.products.tradeitem.table.g.unit2',
    defaultMessage: '申报单位二',
  },
  gUnit3: {
    id: 'scv.products.tradeitem.table.g.unit3',
    defaultMessage: '申报单位三',
  },
  unit1: {
    id: 'scv.products.tradeitem.table.unit1',
    defaultMessage: '法一计量单位',
  },
  unit2: {
    id: 'scv.products.tradeitem.table.unit2',
    defaultMessage: '法二计量单位',
  },
  fixedQty: {
    id: 'scv.products.tradeitem.fixed.qty',
    defaultMessage: '固定值',
  },
  fixedUnit: {
    id: 'scv.products.tradeitem.fixed.unit',
    defaultMessage: '固值单位',
  },
  origCountry: {
    id: 'scv.products.tradeitem.table.origin.country',
    defaultMessage: '产销国',
  },
  unitNetWt: {
    id: 'scv.products.tradeitem.table.unit.netwt',
    defaultMessage: '单个净重',
  },
  grosswt: {
    id: 'scv.products.tradeitem.table.gross.wt',
    defaultMessage: '毛重',
  },
  netwt: {
    id: 'scv.products.tradeitem.table.net.wt',
    defaultMessage: '净重',
  },
  customsControl: {
    id: 'scv.products.tradeitem.table.customs.control',
    defaultMessage: '海关监管条件',
  },
  inspQuarantine: {
    id: 'scv.products.tradeitem.table.inspection.quarantine',
    defaultMessage: '商检检验检疫',
  },
  unitPrice: {
    id: 'scv.products.tradeitem.table.unit.price',
    defaultMessage: '单价',
  },
  currency: {
    id: 'scv.products.tradeitem.table.currency',
    defaultMessage: '币制',
  },
  preClassifyNo: {
    id: 'scv.products.tradeitem.table.pre.classify.no',
    defaultMessage: '预归类编号',
  },
  preClassifyStartDate: {
    id: 'scv.products.tradeitem.table.pre.classify.start.date',
    defaultMessage: '预归类日期',
  },
  preClassifyEndDate: {
    id: 'scv.products.tradeitem.table.pre.classify.end.date',
    defaultMessage: '到期日期',
  },
  remark: {
    id: 'scv.products.tradeitem.table.remark',
    defaultMessage: '备注',
  },
  addRepo: {
    id: 'scv.products.tradeitem.modal.add.owner',
    defaultMessage: '添加企业物料库',
  },
  addItem: {
    id: 'scv.products.tradeitem.table.add',
    defaultMessage: '添加物料',
  },
  importItems: {
    id: 'scv.products.tradeitem.items.import',
    defaultMessage: '对比导入',
  },
  importHsunit: {
    id: 'scv.products.hscode.gunit.import',
    defaultMessage: '导入申报单位',
  },
  tradeCode: {
    id: 'scv.products.tradeitem.tabpane.cop.code',
    defaultMessage: '单位代码',
  },
  compCode: {
    id: 'scv.products.tradeitem.tabpane.comp.code',
    defaultMessage: '信用代码',
  },
  customsCode: {
    id: 'scv.products.tradeitem.tabpane.customs.code',
    defaultMessage: '海关编码',
  },
  tradeName: {
    id: 'scv.products.tradeitem.tabpane.cop.name',
    defaultMessage: '企业名称',
  },
  opColumn: {
    id: 'scv.products.tradeitem.column.operation',
    defaultMessage: '操作',
  },
  delete: {
    id: 'scv.products.tradeitem.delete',
    defaultMessage: '删除',
  },
  cancel: {
    id: 'scv.products.tradeitem.cancel',
    defaultMessage: '取消',
  },
  save: {
    id: 'scv.products.tradeitem.save',
    defaultMessage: '保存',
  },
  modify: {
    id: 'scv.products.tradeitem.modify',
    defaultMessage: '修改',
  },
  deleteConfirm: {
    id: 'scv.products.tradeitem.delete.confirm',
    defaultMessage: '确认删除?',
  },
  newItem: {
    id: 'scv.products.tradeitem.new.item',
    defaultMessage: '新增物料',
  },
  editItem: {
    id: 'scv.products.tradeitem.edit.item',
    defaultMessage: '修改物料',
  },
  declareWay: {
    id: 'scv.products.tradeitem.declare.way',
    defaultMessage: '报关类型',
  },
  declareUnit: {
    id: 'scv.products.tradeitem.declare.unit',
    defaultMessage: '申报单位',
  },
  declunitName: {
    id: 'scv.products.tradeitem.declunit.name',
    defaultMessage: '申报单位分类名称',
  },
  declunitCode: {
    id: 'scv.products.tradeitem.declunit.code',
    defaultMessage: '申报单位代码',
  },
  status: {
    id: 'scv.products.tradeitem.status',
    defaultMessage: '状态',
  },
  pass: {
    id: 'scv.products.tradeitem.pass',
    defaultMessage: '通过',
  },
  refuse: {
    id: 'scv.products.tradeitem.refuse',
    defaultMessage: '拒绝',
  },
  broker: {
    id: 'scv.products.tradeitem.broker',
    defaultMessage: '指定报关行',
  },
});
export default messages;
