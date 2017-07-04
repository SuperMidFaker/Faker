import { defineMessages } from 'react-intl';

export default defineMessages({
  importClearance: {
    id: 'cms.common.delegation.import.clearance',
    defaultMessage: '进口申报',
  },
  exportClearance: {
    id: 'cms.common.delegation.export.clearance',
    defaultMessage: '出口申报',
  },
  cmsDelegation: {
    id: 'cms.common.delegation',
    defaultMessage: '委托',
  },
  createDelegation: {
    id: 'cms.common.delegation.create',
    defaultMessage: '新建委托',
  },
  modifyDelegation: {
    id: 'cms.common.delegation.modify',
    defaultMessage: '修改委托',
  },
  delgClearance: {
    id: 'cms.common.delegation.clearance',
    defaultMessage: '清关业务',
  },
  searchPlaceholder: {
    id: 'cms.common.delegation.search.placeholder',
    defaultMessage: '委托编号/提运单号/订单号/发票号',
  },
  delegationManagement: {
    id: 'cms.common.delegation.management',
    defaultMessage: '委托管理',
  },
  all: {
    id: 'cms.common.delegation.stage.all',
    defaultMessage: '全部',
  },
  accepting: {
    id: 'cms.common.delegation.stage.accepting',
    defaultMessage: '接单',
  },
  processing: {
    id: 'cms.common.delegation.stage.processing',
    defaultMessage: '制单',
  },
  declaring: {
    id: 'cms.common.delegation.stage.declaring',
    defaultMessage: '申报',
  },
  releasing: {
    id: 'cms.common.delegation.stage.releasing',
    defaultMessage: '放行',
  },
  ciqPending: {
    id: 'cms.common.delegation.stage.ciq.pending',
    defaultMessage: '报检待处理',
  },
  ciqPassed: {
    id: 'cms.common.delegation.stage.ciq.passed',
    defaultMessage: '报检已通过',
  },
  delgInfo: {
    id: 'cms.common.delegation.delg.info',
    defaultMessage: '基础信息',
  },
  delgNo: {
    id: 'cms.common.delegation.delg.no',
    defaultMessage: '委托编号',
  },
  delgClient: {
    id: 'cms.common.delegation.delg.client',
    defaultMessage: '客户',
  },
  delgTime: {
    id: 'cms.common.delegation.delg.time',
    defaultMessage: '委托日期',
  },
  acptTime: {
    id: 'cms.common.delegation.delg.acpttime',
    defaultMessage: '接单日期',
  },
  contractNo: {
    id: 'cms.common.delegation.delg.contract.no',
    defaultMessage: '合同号',
  },
  transMode: {
    id: 'cms.common.delegation.delg.trans_mode',
    defaultMessage: '运输方式',
  },
  waybillLadingNo: {
    id: 'cms.common.delegation.delg.waybill.lading.no',
    defaultMessage: '提运单号',
  },
  deliveryNo: {
    id: 'cms.common.delegation.delg.delivery.no',
    defaultMessage: '运单号',
  },
  bLNo: {
    id: 'cms.common.delegation.delg.bill.lading.no',
    defaultMessage: '提单号',
  },
  invoiceNo: {
    id: 'cms.common.delegation.delg.invoice.no',
    defaultMessage: '发票号',
  },
  orderNo: {
    id: 'cms.common.delegation.delg.order.no',
    defaultMessage: '订单号',
  },
  voyageNo: {
    id: 'cms.common.delegation.delg.voyage.no',
    defaultMessage: '船名/航次',
  },
  flightNo: {
    id: 'cms.common.delegation.delg.flight.no',
    defaultMessage: '航班号',
  },
  delgInternalNo: {
    id: 'cms.common.delegation.delg.internal.no',
    defaultMessage: '外部编号',
  },
  preEntryNo: {
    id: 'cms.common.delegation.delg.preEntry.no',
    defaultMessage: '预报关编号',
  },
  delgPieces: {
    id: 'cms.common.delegation.delg.pieces',
    defaultMessage: '总件数',
  },
  packageNum: {
    id: 'cms.common.delegation.delg.packageNum',
    defaultMessage: '件数',
  },
  delgWeight: {
    id: 'cms.common.delegation.delg.weight',
    defaultMessage: '总毛重',
  },
  delgGrossWt: {
    id: 'cms.common.delegation.delg.grosswt',
    defaultMessage: '毛重',
  },
  remark: {
    id: 'cms.common.delegation.delg.remark',
    defaultMessage: '备注',
  },
  ciqType: {
    id: 'cms.common.delegation.delg.ciq.type',
    defaultMessage: '检验检疫',
  },
  broker: {
    id: 'cms.common.delegation.delg.broker',
    defaultMessage: '报关代理',
  },
  inspbroker: {
    id: 'cms.common.delegation.delg.inspbroker',
    defaultMessage: '报检代理',
  },
  certbroker: {
    id: 'cms.common.delegation.delg.certbroker',
    defaultMessage: '鉴定办证企业',
  },
  goodsType: {
    id: 'cms.common.delegation.delg.goodstype',
    defaultMessage: '货物类型',
  },
  declareCustoms: {
    id: 'cms.common.delegation.declare.customs',
    defaultMessage: '申报地海关',
  },
  declareWay: {
    id: 'cms.common.delegation.delg.declareWay',
    defaultMessage: '报关类型',
  },
  manualNo: {
    id: 'cms.common.delegation.delg.manualNo',
    defaultMessage: '备案号',
  },
  status: {
    id: 'cms.common.delegation.delg.status',
    defaultMessage: '状态',
  },
  declStatus: {
    id: 'cms.common.delegation.delg.decl.status',
    defaultMessage: '报关状态',
  },
  ciqStatus: {
    id: 'cms.common.delegation.delg.ciq.status',
    defaultMessage: '报检状态',
  },
  delgSource: {
    id: 'cms.common.delegation.delg.source',
    defaultMessage: '来源',
  },
  billNo: {
    id: 'cms.common.delegation.delg.billNo',
    defaultMessage: '子业务编号',
  },
  compEntryId: {
    id: 'cms.common.delegation.delg.comp.entryId',
    defaultMessage: '企业报关单编号',
  },
  entryId: {
    id: 'cms.common.delegation.delg.entryId',
    defaultMessage: '海关编号',
  },
  consginSource: {
    id: 'cms.common.delegation.consign.source',
    defaultMessage: '委托',
  },
  subcontractSource: {
    id: 'cms.common.delegation.subcontract.source',
    defaultMessage: '分包',
  },
  opColumn: {
    id: 'cms.common.delegation.delg.opColumn',
    defaultMessage: '操作',
  },
  modify: {
    id: 'cms.common.delegation.delg.modify',
    defaultMessage: '修改',
  },
  delete: {
    id: 'cms.common.delegation.delg.delete',
    defaultMessage: '删除',
  },
  deleteConfirm: {
    id: 'cms.common.delegation.delg.delete.confirm',
    defaultMessage: '确认删除？',
  },
  delgRecall: {
    id: 'cms.common.delegation.delg.recall',
    defaultMessage: '撤回',
  },
  delgDispatch: {
    id: 'cms.common.delegation.delg.dispatch',
    defaultMessage: '分配报关代理',
  },
  downloadCert: {
    id: 'cms.common.delegation.delg.downloadCert',
    defaultMessage: '下载单据',
  },
  declareMake: {
    id: 'cms.common.delegation.make',
    defaultMessage: '制单',
  },
  createManifest: {
    id: 'cms.common.delegation.manifest.create',
    defaultMessage: '开始制单',
  },
  viewManifest: {
    id: 'cms.common.delegation.manifest.view',
    defaultMessage: '查看清单',
  },
  editManifest: {
    id: 'cms.common.delegation.manifest.edit',
    defaultMessage: '编辑清单',
  },
  trackDecl: {
    id: 'cms.common.delegation.track.decl',
    defaultMessage: '通关追踪',
  },
  completeDelg: {
    id: 'cms.common.delegation.complete.delg',
    defaultMessage: '结单',
  },
  writeEntryId: {
    id: 'cms.common.delegation.write.entryId',
    defaultMessage: '填写报关单号',
  },
  declareBill: {
    id: 'cms.common.delegation.bill',
    defaultMessage: '申报清单',
  },
  newDeclaration: {
    id: 'cms.common.delegation.new.declaration',
    defaultMessage: '制作报关单',
  },
  generateEntry: {
    id: 'cms.common.delegation.generate.entry',
    defaultMessage: '由清单归并生成',
  },
  addEntry: {
    id: 'cms.common.delegation.add.entry',
    defaultMessage: '直接添加报关单',
  },
  entryNoFillModalTitle: {
    id: 'cms.common.delegation.modal.entrynofill.title',
    defaultMessage: '填写报关单号',
  },
  ciqNoFillModalTitle: {
    id: 'cms.common.delegation.modal.ciqnofill.title',
    defaultMessage: '填写通关单号',
  },
  successfulOperation: {
    id: 'cms.common.delegation.modal.successful.operation',
    defaultMessage: '操作成功',
  },
  startMaking: {
    id: 'cms.common.delegation.modal.start.making',
    defaultMessage: '开始制单',
  },
  makeConfirm: {
    id: 'cms.common.delegation.modal.make.confirm',
    defaultMessage: '已接受报关委托，开始制单？',
  },
  newImportDelg: {
    id: 'cms.common.delegation.import.new',
    defaultMessage: '新建进口清关',
  },
  newExportDelg: {
    id: 'cms.common.delegation.export.new',
    defaultMessage: '新建出口清关',
  },
  delgSaveConfirm: {
    id: 'cms.common.delegation.delgsave.confirm',
    defaultMessage: '确认保存接单？',
  },
  acceptNow: {
    id: 'cms.common.delegation.accept.now',
    defaultMessage: '一键接单',
  },
  save: {
    id: 'cms.common.delegation.save',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'cms.common.delegation.cancel',
    defaultMessage: '取消',
  },
  addMore: {
    id: 'cms.common.delegation.addMore',
    defaultMessage: '添加清关业务',
  },
  lastActTime: {
    id: 'cms.common.delegation.last.act.time',
    defaultMessage: '最后更新时间',
  },
  ciqTime: {
    id: 'cms.common.delegation.ciq.time',
    defaultMessage: '报检时间',
  },
  clrStatus: {
    id: 'cms.common.delegation.clr.status',
    defaultMessage: '通关状态',
  },
  processDate: {
    id: 'cms.common.delegation.process.date',
    defaultMessage: '更新时间',
  },
  ciqDispatch: {
    id: 'cms.common.delegation.delg.ciq.dispatch',
    defaultMessage: '分配报检业务',
  },
  allDispatch: {
    id: 'cms.common.delegation.delg.all.dispatch',
    defaultMessage: '清关业务转包',
  },
  certDispatch: {
    id: 'cms.common.delegation.delg.cert.dispatch',
    defaultMessage: '分配鉴定办证',
  },
  dispDecl: {
    id: 'cms.common.delegation.delg.dispDecl',
    defaultMessage: '选择报关代理',
  },
  dispciq: {
    id: 'cms.common.delegation.delg.dispciq',
    defaultMessage: '选择报检代理',
  },
  dispall: {
    id: 'cms.common.delegation.delg.dispall',
    defaultMessage: '选择报关报检单位',
  },
  dispCert: {
    id: 'cms.common.delegation.delg.dispCert',
    defaultMessage: '选择鉴定办证单位',
  },
  ciq: {
    id: 'cms.common.delegation.delg.ciq',
    defaultMessage: '报检',
  },
  ciqFinish: {
    id: 'cms.common.delegation.ciq.finish',
    defaultMessage: '完成',
  },
  cert: {
    id: 'cms.common.delegation.delg.cert',
    defaultMessage: '鉴定办证',
  },
  certOp: {
    id: 'cms.common.delegation.certOp',
    defaultMessage: '鉴定办证',
  },
  acceptSaveMessage: {
    id: 'cms.common.delegation.edit.message.accept',
    defaultMessage: '确定保存接单?',
  },
  delgTo: {
    id: 'cms.common.delegation.list.delgTo',
    defaultMessage: '委托',
  },
  createdEvent: {
    id: 'cms.common.delegation.event.created',
    defaultMessage: '创建',
  },
  acceptedEvent: {
    id: 'cms.common.delegation.event.accepted',
    defaultMessage: '接单',
  },
  processedEvent: {
    id: 'cms.common.delegation.event.processed',
    defaultMessage: '制单',
  },
  declaredEvent: {
    id: 'cms.common.delegation.event.declared',
    defaultMessage: '申报',
  },
  releasedEvent: {
    id: 'cms.common.delegation.event.released',
    defaultMessage: '放行',
  },
  declaredPart: {
    id: 'cms.common.delegation.declaredPart',
    defaultMessage: '部分申报',
  },
  releasedPart: {
    id: 'cms.common.delegation.releasedPart',
    defaultMessage: '部分放行',
  },
  customsId: {
    id: 'cms.common.delegation.customsId',
    defaultMessage: '通关单号',
  },
  upload: {
    id: 'cms.common.delegation.upload',
    defaultMessage: '上传',
  },
  info: {
    id: 'cms.common.delegation.expense,info',
    defaultMessage: '无匹配报价规则',
  },
  certFee: {
    id: 'cms.common.delegation.certFee',
    defaultMessage: '办证费用项',
  },
  certPrice: {
    id: 'cms.common.delegation.certPrice',
    defaultMessage: '单价',
  },
  certCount: {
    id: 'cms.common.delegation.certCount',
    defaultMessage: '数量',
  },
  certTax: {
    id: 'cms.common.delegation.certTax',
    defaultMessage: '税金',
  },
  certCalfee: {
    id: 'cms.common.delegation.certCalfee',
    defaultMessage: '费用金额',
  },
  certTotal: {
    id: 'cms.common.delegation.certTotal',
    defaultMessage: '总金额',
  },
  allocateOriginator: {
    id: 'cms.common.delegation.allocate.originator',
    defaultMessage: '指定执行者',
  },
});
