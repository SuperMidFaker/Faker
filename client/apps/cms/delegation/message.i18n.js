import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  delgManifest: {
    id: 'cms.delegation.manifest',
    defaultMessage: '委托管理',
  },
  createDelegation: {
    id: 'cms.delegation.create',
    defaultMessage: '新建委托',
  },
  modifyDelegation: {
    id: 'cms.delegation.edit',
    defaultMessage: '修改委托',
  },
  manifestSetting: {
    id: 'cms.delegation.manifest.setting',
    defaultMessage: '制单设置',
  },
  searchPlaceholder: {
    id: 'cms.delegation.search.placeholder',
    defaultMessage: '委托编号/提运单号/客户单号',
  },
  filterImport: {
    id: 'cms.delegation.filter.import',
    defaultMessage: '进口',
  },
  filterExport: {
    id: 'cms.delegation.filter.export',
    defaultMessage: '出口',
  },
  allDelegation: {
    id: 'cms.delegation.all',
    defaultMessage: '全部委托',
  },
  accepting: {
    id: 'cms.delegation.stage.accepting',
    defaultMessage: '接单',
  },
  processing: {
    id: 'cms.delegation.stage.processing',
    defaultMessage: '制单',
  },
  declaring: {
    id: 'cms.delegation.stage.declaring',
    defaultMessage: '申报',
  },
  releasing: {
    id: 'cms.delegation.stage.releasing',
    defaultMessage: '放行',
  },
  ciqPending: {
    id: 'cms.delegation.stage.ciq.pending',
    defaultMessage: '报检待处理',
  },
  ciqPassed: {
    id: 'cms.delegation.stage.ciq.passed',
    defaultMessage: '报检已通过',
  },
  delgInfo: {
    id: 'cms.delegation.info',
    defaultMessage: '基础信息',
  },
  delgNo: {
    id: 'cms.delegation.no',
    defaultMessage: '委托编号',
  },
  client: {
    id: 'cms.delegation.client',
    defaultMessage: '委托单位',
  },
  delgTime: {
    id: 'cms.delegation.time',
    defaultMessage: '委托日期',
  },
  acptTime: {
    id: 'cms.delegation.acpttime',
    defaultMessage: '接单日期',
  },
  contractNo: {
    id: 'cms.delegation.contract.no',
    defaultMessage: '合同号',
  },
  transMode: {
    id: 'cms.delegation.trans_mode',
    defaultMessage: '运输方式',
  },
  waybillLadingNo: {
    id: 'cms.delegation.waybill.lading.no',
    defaultMessage: '提运单号',
  },
  deliveryNo: {
    id: 'cms.delegation.delivery.no',
    defaultMessage: '运单号',
  },
  bLNo: {
    id: 'cms.delegation.bill.lading.no',
    defaultMessage: '提单号',
  },
  invoiceNo: {
    id: 'cms.delegation.invoice.no',
    defaultMessage: '发票号',
  },
  orderNo: {
    id: 'cms.delegation.order.no',
    defaultMessage: '客户单号',
  },
  voyageNo: {
    id: 'cms.delegation.voyage.no',
    defaultMessage: '船名/航次',
  },
  flightNo: {
    id: 'cms.delegation.flight.no',
    defaultMessage: '航班号',
  },
  delgInternalNo: {
    id: 'cms.delegation.internal.no',
    defaultMessage: '外部编号',
  },
  preEntryNo: {
    id: 'cms.delegation.preEntry.no',
    defaultMessage: '统一编号',
  },
  delgPieces: {
    id: 'cms.delegation.pieces',
    defaultMessage: '总件数',
  },
  packageNum: {
    id: 'cms.delegation.packageNum',
    defaultMessage: '件数',
  },
  delgWeight: {
    id: 'cms.delegation.weight',
    defaultMessage: '总毛重',
  },
  delgGrossWt: {
    id: 'cms.delegation.grosswt',
    defaultMessage: '毛重',
  },
  remark: {
    id: 'cms.delegation.remark',
    defaultMessage: '备注',
  },
  ciqType: {
    id: 'cms.delegation.ciq.type',
    defaultMessage: '报检类型',
  },
  customsBroker: {
    id: 'cms.delegation.customs.broker',
    defaultMessage: '报关代理',
  },
  ciqBroker: {
    id: 'cms.delegation.ciq.broker',
    defaultMessage: '报检代理',
  },
  certbroker: {
    id: 'cms.delegation.certbroker',
    defaultMessage: '鉴定办证企业',
  },
  operatedBy: {
    id: 'cms.delegation.opertated.by',
    defaultMessage: '制单人员',
  },
  goodsType: {
    id: 'cms.delegation.goodstype',
    defaultMessage: '货物类型',
  },
  declareCustoms: {
    id: 'cms.delegation.declare.customs',
    defaultMessage: '申报地海关',
  },
  declareWay: {
    id: 'cms.delegation.declareWay',
    defaultMessage: '报关类型',
  },
  manualNo: {
    id: 'cms.delegation.manualNo',
    defaultMessage: '备案号',
  },
  status: {
    id: 'cms.delegation.status',
    defaultMessage: '状态',
  },
  declStatus: {
    id: 'cms.delegation.decl.status',
    defaultMessage: '报关状态',
  },
  ciqStatus: {
    id: 'cms.delegation.ciq.status',
    defaultMessage: '报检状态',
  },
  delgSource: {
    id: 'cms.delegation.source',
    defaultMessage: '来源',
  },
  billNo: {
    id: 'cms.delegation.billNo',
    defaultMessage: '子业务编号',
  },
  compEntryId: {
    id: 'cms.delegation.comp.entryId',
    defaultMessage: '企业报关单编号',
  },
  entryId: {
    id: 'cms.delegation.entryId',
    defaultMessage: '海关编号',
  },
  consginSource: {
    id: 'cms.delegation.consign.source',
    defaultMessage: '委托',
  },
  subcontractSource: {
    id: 'cms.delegation.subcontract.source',
    defaultMessage: '分包',
  },
  opColumn: {
    id: 'cms.delegation.opColumn',
    defaultMessage: '操作',
  },
  modify: {
    id: 'cms.delegation.modify',
    defaultMessage: '修改',
  },
  delete: {
    id: 'cms.delegation.delete',
    defaultMessage: '删除',
  },
  clone: {
    id: 'cms.delegation.clone',
    defaultMessage: '复制',
  },
  auth: {
    id: 'cms.delegation.auth',
    defaultMessage: '授权',
  },
  deleteConfirm: {
    id: 'cms.delegation.delete.confirm',
    defaultMessage: '确定删除？',
  },
  delgRecall: {
    id: 'cms.delegation.recall',
    defaultMessage: '撤回',
  },
  delgDispatch: {
    id: 'cms.delegation.dispatch',
    defaultMessage: '分配报关代理',
  },
  downloadCert: {
    id: 'cms.delegation.downloadCert',
    defaultMessage: '下载单据',
  },
  declareMake: {
    id: 'cms.delegation.make',
    defaultMessage: '制单',
  },
  exchangeSeaDoc: {
    id: 'cms.delegation.exchange.sea.doc',
    defaultMessage: '换单',
  },
  exchangeAirDoc: {
    id: 'cms.delegation.exchange.air.doc',
    defaultMessage: '抽单',
  },
  createManifest: {
    id: 'cms.delegation.manifest.create',
    defaultMessage: '开始制单',
  },
  viewManifest: {
    id: 'cms.delegation.manifest.view',
    defaultMessage: '报关清单',
  },
  editManifest: {
    id: 'cms.delegation.manifest.edit',
    defaultMessage: '报关清单',
  },
  trackDecl: {
    id: 'cms.delegation.track.decl',
    defaultMessage: '通关追踪',
  },
  completeDelg: {
    id: 'cms.delegation.complete.delg',
    defaultMessage: '结单',
  },
  writeEntryId: {
    id: 'cms.delegation.write.entryId',
    defaultMessage: '填写报关单号',
  },
  declareBill: {
    id: 'cms.delegation.bill',
    defaultMessage: '报关清单',
  },
  newDeclaration: {
    id: 'cms.delegation.new.declaration',
    defaultMessage: '制作报关单',
  },
  generateEntry: {
    id: 'cms.delegation.generate.entry',
    defaultMessage: '由清单归并生成',
  },
  addEntry: {
    id: 'cms.delegation.add.entry',
    defaultMessage: '直接添加报关单',
  },
  entryNoFillModalTitle: {
    id: 'cms.delegation.modal.entrynofill.title',
    defaultMessage: '填写报关单号',
  },
  ciqNoFillModalTitle: {
    id: 'cms.delegation.modal.ciqnofill.title',
    defaultMessage: '填写通关单号',
  },
  successfulOperation: {
    id: 'cms.delegation.modal.successful.operation',
    defaultMessage: '操作成功',
  },
  startMaking: {
    id: 'cms.delegation.modal.start.making',
    defaultMessage: '开始制单',
  },
  makeConfirm: {
    id: 'cms.delegation.modal.make.confirm',
    defaultMessage: '已接受报关委托，开始制单？',
  },
  newImportDelg: {
    id: 'cms.delegation.import.new',
    defaultMessage: '新建进口清关',
  },
  newExportDelg: {
    id: 'cms.delegation.export.new',
    defaultMessage: '新建出口清关',
  },
  delgSaveConfirm: {
    id: 'cms.delegation.delgsave.confirm',
    defaultMessage: '确认保存接单？',
  },
  acceptNow: {
    id: 'cms.delegation.accept.now',
    defaultMessage: '一键接单',
  },
  save: {
    id: 'cms.delegation.save',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'cms.delegation.cancel',
    defaultMessage: '取消',
  },
  addMore: {
    id: 'cms.delegation.addMore',
    defaultMessage: '添加清关业务',
  },
  lastActTime: {
    id: 'cms.delegation.last.act.time',
    defaultMessage: '最后更新时间',
  },
  ciqTime: {
    id: 'cms.delegation.ciq.time',
    defaultMessage: '报检时间',
  },
  clrStatus: {
    id: 'cms.delegation.clr.status',
    defaultMessage: '通关状态',
  },
  processDate: {
    id: 'cms.delegation.process.date',
    defaultMessage: '更新时间',
  },
  ciqDispatch: {
    id: 'cms.delegation.ciq.dispatch',
    defaultMessage: '分配报检业务',
  },
  allDispatch: {
    id: 'cms.delegation.all.dispatch',
    defaultMessage: '清关业务转包',
  },
  certDispatch: {
    id: 'cms.delegation.cert.dispatch',
    defaultMessage: '分配鉴定办证',
  },
  dispDecl: {
    id: 'cms.delegation.dispDecl',
    defaultMessage: '选择报关代理',
  },
  dispciq: {
    id: 'cms.delegation.dispciq',
    defaultMessage: '选择报检代理',
  },
  dispall: {
    id: 'cms.delegation.dispall',
    defaultMessage: '选择报关报检单位',
  },
  dispCert: {
    id: 'cms.delegation.dispCert',
    defaultMessage: '选择鉴定办证单位',
  },
  ciq: {
    id: 'cms.delegation.ciq',
    defaultMessage: '报检',
  },
  ciqFinish: {
    id: 'cms.delegation.ciq.finish',
    defaultMessage: '完成',
  },
  cert: {
    id: 'cms.delegation.cert',
    defaultMessage: '鉴定办证',
  },
  certOp: {
    id: 'cms.delegation.certOp',
    defaultMessage: '鉴定办证',
  },
  acceptSaveMessage: {
    id: 'cms.delegation.edit.message.accept',
    defaultMessage: '确定保存接单?',
  },
  delgTo: {
    id: 'cms.delegation.list.delgTo',
    defaultMessage: '委托',
  },
  createdEvent: {
    id: 'cms.delegation.event.created',
    defaultMessage: '创建',
  },
  acceptedEvent: {
    id: 'cms.delegation.event.accepted',
    defaultMessage: '接单',
  },
  processedEvent: {
    id: 'cms.delegation.event.processed',
    defaultMessage: '制单',
  },
  declaredEvent: {
    id: 'cms.delegation.event.declared',
    defaultMessage: '申报',
  },
  releasedEvent: {
    id: 'cms.delegation.event.released',
    defaultMessage: '放行',
  },
  declaredPart: {
    id: 'cms.delegation.declaredPart',
    defaultMessage: '部分申报',
  },
  releasedPart: {
    id: 'cms.delegation.releasedPart',
    defaultMessage: '部分放行',
  },
  customsId: {
    id: 'cms.delegation.customsId',
    defaultMessage: '通关单号',
  },
  upload: {
    id: 'cms.delegation.upload',
    defaultMessage: '上传',
  },
  info: {
    id: 'cms.delegation.expense,info',
    defaultMessage: '无匹配报价规则',
  },
  certFee: {
    id: 'cms.delegation.certFee',
    defaultMessage: '办证费用项',
  },
  certPrice: {
    id: 'cms.delegation.certPrice',
    defaultMessage: '单价',
  },
  certCount: {
    id: 'cms.delegation.certCount',
    defaultMessage: '数量',
  },
  certTax: {
    id: 'cms.delegation.certTax',
    defaultMessage: '税金',
  },
  certCalfee: {
    id: 'cms.delegation.certCalfee',
    defaultMessage: '费用金额',
  },
  certTotal: {
    id: 'cms.delegation.certTotal',
    defaultMessage: '总金额',
  },
  allocateOriginator: {
    id: 'cms.delegation.allocate.originator',
    defaultMessage: '指定执行者',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
