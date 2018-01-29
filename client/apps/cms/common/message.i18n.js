import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  delgNo: {
    id: 'cms.forms.delg.no',
    defaultMessage: '委托编号',
  },
  customer: {
    id: 'cms.forms.delg.client',
    defaultMessage: '客户',
  },
  delgTime: {
    id: 'cms.forms.delg.time',
    defaultMessage: '委托日期',
  },
  acptTime: {
    id: 'cms.forms.delg.acpttime',
    defaultMessage: '接单日期',
  },
  contractNo: {
    id: 'cms.forms.delg.contract.no',
    defaultMessage: '合同协议号',
  },
  deliveryNo: {
    id: 'cms.forms.delg.delivery.no',
    defaultMessage: '提运单号',
  },
  invoiceNo: {
    id: 'cms.forms.delg.invoice.no',
    defaultMessage: '发票号',
  },
  declPort: {
    id: 'cms.manifest.form.decl.port',
    defaultMessage: '申报地海关',
  },
  voyageNo: {
    id: 'cms.forms.delg.voyage.no',
    defaultMessage: '航次号',
  },
  delgInternalNo: {
    id: 'cms.forms.delg.internal.no',
    defaultMessage: '统一编号',
  },
  packageNum: {
    id: 'cms.forms.delg.packageNum',
    defaultMessage: '件数',
  },
  delgWeight: {
    id: 'cms.forms.delg.weight',
    defaultMessage: '重量',
  },
  paymentRoyalty: {
    id: 'cms.forms.delg.payment.royalty',
    defaultMessage: '支付特许权使用费确认',
  },
  priceEffect: {
    id: 'cms.forms.delg.price.effect',
    defaultMessage: '价格影响确认',
  },
  specialRelation: {
    id: 'cms.forms.delg.special.relation',
    defaultMessage: '特殊关系确认',
  },
  delgSource: {
    id: 'cms.forms.delg.source',
    defaultMessage: '来源',
  },
  billNo: {
    id: 'cms.forms.delg.billNo',
    defaultMessage: '清单编号',
  },
  compEntryId: {
    id: 'cms.forms.delg.comp.entryId',
    defaultMessage: '企业报关单编号',
  },
  entryId: {
    id: 'cms.forms.delg.entryId',
    defaultMessage: '报关单号',
  },
  consginSource: {
    id: 'cms.forms.consign.source',
    defaultMessage: '委托',
  },
  subcontractSource: {
    id: 'cms.forms.subcontract.source',
    defaultMessage: '分包',
  },
  opColumn: {
    id: 'cms.forms.delg.opColumn',
    defaultMessage: '操作',
  },
  downloadCert: {
    id: 'cms.forms.delg.downloadCert',
    defaultMessage: '下载单据',
  },
  declareMake: {
    id: 'cms.forms.make',
    defaultMessage: '制单',
  },
  declareView: {
    id: 'cms.forms.view',
    defaultMessage: '查看',
  },
  writeEntryId: {
    id: 'cms.forms.write.entryId',
    defaultMessage: '填写报关单号',
  },
  declareBill: {
    id: 'cms.forms.bill',
    defaultMessage: '申报清单',
  },
  newDeclaration: {
    id: 'cms.forms.new.declaration',
    defaultMessage: '制作报关单',
  },
  generateEntry: {
    id: 'cms.forms.generate.entry',
    defaultMessage: '生成报关建议书',
  },
  addEntry: {
    id: 'cms.forms.add.entry',
    defaultMessage: '直接添加报关单',
  },
  removeEntries: {
    id: 'cms.forms.remove.entries',
    defaultMessage: '删除报关单',
  },
  billHeader: {
    id: 'cms.forms.form.bill.header',
    defaultMessage: '清单表头',
  },
  billList: {
    id: 'cms.forms.form.bill.list',
    defaultMessage: '申报商品明细',
  },
  preEntryId: {
    id: 'cms.forms.form.pre.entry.id',
    defaultMessage: '预录入编号',
  },
  formEntryId: {
    id: 'cms.forms.form.entry.id',
    defaultMessage: '海关编号',
  },
  iport: {
    id: 'cms.forms.form.iport',
    defaultMessage: '进口口岸',
  },
  eport: {
    id: 'cms.forms.form.eport',
    defaultMessage: '出口口岸',
  },
  idate: {
    id: 'cms.forms.form.idate',
    defaultMessage: '进口日期',
  },
  edate: {
    id: 'cms.forms.form.edate',
    defaultMessage: '出口日期',
  },
  ddate: {
    id: 'cms.forms.form.ddate',
    defaultMessage: '申报日期',
  },
  transMode: {
    id: 'cms.forms.form.transMode',
    defaultMessage: '运输方式',
  },
  transModeName: {
    id: 'cms.forms.form.transModeName',
    defaultMessage: '运输工具名称',
  },
  ladingWayBill: {
    id: 'cms.forms.form.ladingWayBill',
    defaultMessage: '提运单号',
  },
  customsCode: {
    id: 'cms.forms.form.customs.code',
    defaultMessage: '企业海关编码',
  },
  scc: {
    id: 'cms.forms.form.customs.scc',
    defaultMessage: '企业信用代码',
  },
  relationName: {
    id: 'cms.forms.form.relation.name',
    defaultMessage: '企业名称',
  },
  forwardName: {
    id: 'cms.forms.form.forward.name',
    defaultMessage: '收发货人',
  },
  ownerConsumeName: {
    id: 'cms.forms.form.owner.consume.name',
    defaultMessage: '消费使用单位',
  },
  ownerProduceName: {
    id: 'cms.forms.form.owner.produce.name',
    defaultMessage: '生产消费单位',
  },
  agentName: {
    id: 'cms.forms.form.agent.name',
    defaultMessage: '申报单位',
  },
  tradeMode: {
    id: 'cms.forms.form.trade.name',
    defaultMessage: '监管方式',
  },
  rmModeName: {
    id: 'cms.forms.form.rm.mode.name',
    defaultMessage: '征免性质',
  },
  emsNo: {
    id: 'cms.forms.form.ems.no',
    defaultMessage: '备案号',
  },
  tradeCountry: {
    id: 'cms.forms.form.trade.country',
    defaultMessage: '贸易国',
  },
  departCountry: {
    id: 'cms.forms.form.depart.country',
    defaultMessage: '启运国',
  },
  destinateCountry: {
    id: 'cms.forms.form.destinate.country',
    defaultMessage: '抵运国',
  },
  licenseNo: {
    id: 'cms.forms.form.license.no',
    defaultMessage: '许可证号',
  },
  trxMode: {
    id: 'cms.forms.form.trx.mode',
    defaultMessage: '成交方式',
  },
  packCount: {
    id: 'cms.forms.form.pack.count',
    defaultMessage: '件数',
  },
  containerNo: {
    id: 'cms.forms.form.container.no',
    defaultMessage: '集装箱号',
  },
  usage: {
    id: 'cms.forms.form.usage',
    defaultMessage: '用途',
  },
  iDestinatePort: {
    id: 'cms.forms.form.idest.port',
    defaultMessage: '装货港',
  },
  eDestinatePort: {
    id: 'cms.forms.form.edest.port',
    defaultMessage: '指运港',
  },
  iDistrict: {
    id: 'cms.forms.form.idistrict',
    defaultMessage: '境内目的地',
  },
  eDistrict: {
    id: 'cms.forms.form.edistrict',
    defaultMessage: '境内货源地',
  },
  freightCharge: {
    id: 'cms.forms.form.freightCharge',
    defaultMessage: '运费',
  },
  insurance: {
    id: 'cms.forms.form.insurance',
    defaultMessage: '保费',
  },
  sundry: {
    id: 'cms.forms.form.sundry',
    defaultMessage: '杂费',
  },
  packType: {
    id: 'cms.forms.form.pack.type',
    defaultMessage: '包装种类',
  },
  grosswt: {
    id: 'cms.forms.form.gross.wt',
    defaultMessage: '毛重',
  },
  netwt: {
    id: 'cms.forms.form.net.wt',
    defaultMessage: '净重',
  },
  certMark: {
    id: 'cms.forms.form.cert.mark',
    defaultMessage: '随附单证',
  },
  markNotes: {
    id: 'cms.forms.form.mark.notes',
    defaultMessage: '唛码备注',
  },
  raDeclNo: {
    id: 'cms.forms.form.relate.decl.no',
    defaultMessage: '关联报关单号',
  },
  raManualNo: {
    id: 'cms.forms.form.relate.manual.no',
    defaultMessage: '关联备案号',
  },
  storeNo: {
    id: 'cms.forms.form.store.no',
    defaultMessage: '保税/监管场所',
  },
  yardCode: {
    id: 'cms.forms.form.yard.code',
    defaultMessage: '货场代码',
  },
  itemNo: {
    id: 'cms.forms.table.item.number',
    defaultMessage: '项号',
  },
  seqNo: {
    id: 'cms.forms.table.seq.number',
    defaultMessage: '序号',
  },
  copGNo: {
    id: 'cms.forms.table.cop.gno',
    defaultMessage: '商品货号',
  },
  emGNo: {
    id: 'cms.forms.table.em.gno',
    defaultMessage: '备案序号',
  },
  codeT: {
    id: 'cms.forms.table.codet',
    defaultMessage: '商品编码',
  },
  codeS: {
    id: 'cms.forms.table.codes',
    defaultMessage: '附加码',
  },
  gName: {
    id: 'cms.forms.table.gname',
    defaultMessage: '商品名称',
  },
  enName: {
    id: 'cms.forms.table.en.name',
    defaultMessage: '英文描述',
  },
  gModel: {
    id: 'cms.forms.table.gmodel',
    defaultMessage: '规格型号',
  },
  element: {
    id: 'cms.forms.table.element',
    defaultMessage: '申报要素',
  },
  quantity: {
    id: 'cms.forms.table.quantity',
    defaultMessage: '申报数量',
  },
  qty1: {
    id: 'cms.forms.table.qty1',
    defaultMessage: '法一数量',
  },
  qty2: {
    id: 'cms.forms.table.qty2',
    defaultMessage: '法二数量',
  },
  unit1: {
    id: 'cms.forms.table.unit1',
    defaultMessage: '法一单位',
  },
  unit2: {
    id: 'cms.forms.table.unit2',
    defaultMessage: '法二单位',
  },
  unit: {
    id: 'cms.forms.table.unit',
    defaultMessage: '申报单位',
  },
  qtyPcs: {
    id: 'cms.forms.table.qty.pcs',
    defaultMessage: '数量(个数)',
  },
  unitPcs: {
    id: 'cms.forms.table.unit.pcs',
    defaultMessage: '单位(个数)',
  },
  origCountry: {
    id: 'cms.forms.table.origCountry',
    defaultMessage: '原产国',
  },
  destCountry: {
    id: 'cms.forms.table.destCountry',
    defaultMessage: '最终目的国',
  },
  decPrice: {
    id: 'cms.forms.table.dec.price',
    defaultMessage: '申报单价',
  },
  decTotal: {
    id: 'cms.forms.table.dec.total',
    defaultMessage: '申报总价',
  },
  currency: {
    id: 'cms.forms.table.currency',
    defaultMessage: '币制',
  },
  exemptionWay: {
    id: 'cms.forms.table.exemptionway',
    defaultMessage: '征免方式',
  },
  versionNo: {
    id: 'cms.forms.table.version.no',
    defaultMessage: '版本号',
  },
  productNo: {
    id: 'cms.forms.table.product.no',
    defaultMessage: '货号',
  },
  processingFees: {
    id: 'cms.forms.table.processing.fees',
    defaultMessage: '工缴费',
  },
  freightFee: {
    id: 'cms.forms.table.freight.fees',
    defaultMessage: '运费',
  },
  save: {
    id: 'cms.forms.table.save',
    defaultMessage: '保存',
  },
  handle: {
    id: 'cms.forms.table.handle',
    defaultMessage: '数据处理',
  },
  import: {
    id: 'cms.forms.table.import',
    defaultMessage: '导入',
  },
  download: {
    id: 'cms.forms.table.download',
    defaultMessage: '下载模板',
  },
  unrelatedImport: {
    id: 'cms.forms.table.import.unrelated',
    defaultMessage: '直接导入',
  },
  relatedImport: {
    id: 'cms.forms.table.import.related',
    defaultMessage: '关联导入',
  },
  cancel: {
    id: 'cms.forms.table.cancel',
    defaultMessage: '取消',
  },
  edit: {
    id: 'cms.forms.table.edit',
    defaultMessage: '编辑',
  },
  delete: {
    id: 'cms.forms.table.delete',
    defaultMessage: '删除',
  },
  append: {
    id: 'cms.forms.table.append',
    defaultMessage: '添加',
  },
  headUncreated: {
    id: 'cms.forms.body.headUncreated',
    defaultMessage: '表头未保存',
  },
  declareEntry: {
    id: 'cms.forms.entry',
    defaultMessage: '报关单',
  },
  entryHeader: {
    id: 'cms.forms.entry.header',
    defaultMessage: '报关单表头',
  },
  entryList: {
    id: 'cms.forms.entry.list',
    defaultMessage: '报关单表体',
  },
  mergePrinciple: {
    id: 'cms.forms.modal.merge.principle',
    defaultMessage: '归并原则',
  },
  splitPrinciple: {
    id: 'cms.forms.modal.split.principle',
    defaultMessage: '拆分原则',
  },
  sortPrinciple: {
    id: 'cms.forms.modal.sort.principle',
    defaultMessage: '排序原则',
  },
  conditionalMerge: {
    id: 'cms.forms.modal.conditional.merge',
    defaultMessage: '条件归并:',
  },
  productName: {
    id: 'cms.forms.modal.product.name',
    defaultMessage: '中文品名',
  },
  productCode: {
    id: 'cms.forms.modal.product.code',
    defaultMessage: '商品货号',
  },
  nonMerge: {
    id: 'cms.forms.modal.non.merge',
    defaultMessage: '不归并:',
  },
  specialHscodeDeclare: {
    id: 'cms.forms.modal.split.special.hscode',
    defaultMessage: '特殊商品编码独立报关',
  },
  customControlDeclare: {
    id: 'cms.forms.modal.split.custom.declare',
    defaultMessage: '海关监管项独立报关',
  },
  customOnTop: {
    id: 'cms.forms.modal.sort.custom.ontop',
    defaultMessage: '海关监管项置顶',
  },
  totalPriceOnTop: {
    id: 'cms.forms.modal.sort.totalprice.ontop',
    defaultMessage: '最大金额项优先',
  },
  hsCodeAscSort: {
    id: 'cms.forms.modal.sort.hscode.asc',
    defaultMessage: '商品编码升序',
  },
  priceDescSort: {
    id: 'cms.forms.modal.sort.price.desc',
    defaultMessage: '申报金额降序',
  },
  entryNoFillModalTitle: {
    id: 'cms.forms.modal.entrynofill.title',
    defaultMessage: '填写报关单号',
  },
  more: {
    id: 'cms.forms.more',
    defaultMessage: '更多',
  },
  customs: {
    id: 'cms.forms.customs',
    defaultMessage: '海关监管条件',
  },
  inspection: {
    id: 'cms.forms.inspection',
    defaultMessage: '检验检疫类别',
  },
  importClearance: {
    id: 'cms.manifest.import.clearance',
    defaultMessage: '进口申报',
  },
  exportClearance: {
    id: 'cms.manifest.export.clearance',
    defaultMessage: '出口申报',
  },
  declManifest: {
    id: 'cms.manifest.decl.manifest',
    defaultMessage: '申报清单',
  },
  searchPlaceholder: {
    id: 'cms.manifest.search.placeholder',
    defaultMessage: '清单编号/委托编号',
  },
  all: {
    id: 'cms.manifest.filter.all',
    defaultMessage: '全部',
  },
  filterWIP: {
    id: 'cms.manifest.filter.wip',
    defaultMessage: '制单中',
  },
  filterGenerated: {
    id: 'cms.manifest.filter.generated',
    defaultMessage: '制单完成',
  },
  generateCDP: {
    id: 'cms.manifest.generate.cdp',
    defaultMessage: '生成报关建议书',
  },
  saveAsTemplate: {
    id: 'cms.manifest.saveas.template',
    defaultMessage: '保存为模板',
  },
  relationCodeSearch: {
    id: 'cms.manifest.form.relation.code.search',
    defaultMessage: '代码搜索',
  },
  importBody: {
    id: 'cms.manifest.table.import',
    defaultMessage: '导入清单',
  },
  docuTemplate: {
    id: 'cms.manifest.modal.docu.template',
    defaultMessage: '单据模板',
  },
  mergeSpecialHscode: {
    id: 'cms.manifest.modal.merge.special.hscode',
    defaultMessage: '特殊商品编码合并',
  },
  mergeSpecialNo: {
    id: 'cms.manifest.modal.merge.special.productno',
    defaultMessage: '特殊商品货号合并',
  },
  specialHscodeSort: {
    id: 'cms.manifest.modal.split.special.hscode.sort',
    defaultMessage: '特殊商品编码分类:',
  },

  currencySplit: {
    id: 'cms.manifest.modal.split.currency',
    defaultMessage: '不同币制独立报关',
  },
  byCiqDeclSplit: {
    id: 'cms.manifest.modal.split.ciq.decl',
    defaultMessage: '报检独立报关',
  },
  byApplCertSplit: {
    id: 'cms.manifest.modal.split.appl.cert',
    defaultMessage: '报检出证独立报关',
  },
  inspectOnTop: {
    id: 'cms.manifest.modal.sort.inspect.ontop',
    defaultMessage: '检验检疫项优先',
  },
  deleteConfirm: {
    id: 'cms.app.settings.delete.confirm',
    defaultMessage: '确定删除该关联客户？',
  },
  billTemplates: {
    id: 'cms.app.settings.bill.templates',
    defaultMessage: '制单规则',
  },
  relatedCustomers: {
    id: 'cms.app.settings.related.customers',
    defaultMessage: '关联客户',
  },
  addRelatedCustomers: {
    id: 'cms.app.settings.add.related.customers',
    defaultMessage: '添加关联客户',
  },
  preEntryNo: {
    id: 'cms.manifest.customs.decl.preentry.no',
    defaultMessage: '预录入海关编号',
  },
  declType: {
    id: 'cms.manifest.customs.decl.declType',
    defaultMessage: '单证类型',
  },
  sendAllPackets: {
    id: 'cms.manifest.customs.send.all.packets',
    defaultMessage: '批量发送申报',
  },
  containerId: {
    id: 'cms.manifest.tabpanes.container.id',
    defaultMessage: '集装箱号',
  },
  containerWt: {
    id: 'cms.manifest.tabpanes.container.wt',
    defaultMessage: '集装箱自重',
  },
  containerSpec: {
    id: 'cms.manifest.tabpanes.container.spec',
    defaultMessage: '集装箱规格-报关',
  },
  containerSpecCiq: {
    id: 'cms.manifest.tabpanes.container.spec.ciq',
    defaultMessage: '集装箱规格-报检',
  },
  containerQty: {
    id: 'cms.manifest.tabpanes.container.qty',
    defaultMessage: '数量',
  },
  docuSpec: {
    id: 'cms.manifest.tabpanes.document.spec',
    defaultMessage: '随附单据文件类别',
  },
  docuCode: {
    id: 'cms.manifest.tabpanes.document.code',
    defaultMessage: '随附单据编号',
  },
  certSpec: {
    id: 'cms.manifest.tabpanes.cert.spec',
    defaultMessage: '单证类型',
  },
  certNum: {
    id: 'cms.manifest.tabpanes.cert.num',
    defaultMessage: '单证编号',
  },
  invoiceDate: {
    id: 'cms.manifest.tabpanes.invoice.date',
    defaultMessage: '发票日期',
  },
  orderNo: {
    id: 'cms.manifest.tabpanes.invoice.order.no',
    defaultMessage: '订单号',
  },
  invoiceType: {
    id: 'cms.manifest.tabpanes.invoice.type',
    defaultMessage: '发票类型',
  },
  invoiceStatus: {
    id: 'cms.manifest.tabpanes.invoice.status',
    defaultMessage: '发票状态',
  },
  totalAmount: {
    id: 'cms.manifest.tabpanes.invoice.total.amount',
    defaultMessage: '总金额',
  },
  totalQuant: {
    id: 'cms.manifest.tabpanes.invoice.total.quant',
    defaultMessage: '总数量',
  },
  totalNetWt: {
    id: 'cms.manifest.tabpanes.invoice.total.net.wt',
    defaultMessage: '总净重',
  },
  pieces: {
    id: 'cms.manifest.tabpanes.invoice.pieces',
    defaultMessage: '件数',
  },
  grossWt: {
    id: 'cms.manifest.tabpanes.invoice.gross.wt',
    defaultMessage: '毛重',
  },
  add: {
    id: 'cms.manifest.tabpanes.add',
    defaultMessage: '添加',
  },
  invoice: {
    id: 'cms.docus.invoice',
    defaultMessage: '发票',
  },
  contract: {
    id: 'cms.docus.contract',
    defaultMessage: '合同',
  },
  packingList: {
    id: 'cms.docus.packing.list',
    defaultMessage: '箱单',
  },
  print: {
    id: 'cms.docus.print',
    defaultMessage: '打印',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
