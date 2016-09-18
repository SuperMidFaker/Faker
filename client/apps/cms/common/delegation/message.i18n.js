import { defineMessages } from 'react-intl';

export default defineMessages({
  cmsDelegation: {
    id: 'cms.delegation',
    defaultMessage: '委托',
  },
  searchPlaceholder: {
    id: 'cms.delegation.search.placeholder',
    defaultMessage: '提运单号/订单号/发票号',
  },
  importDeclaration: {
    id: 'cms.delegation.import.declaration',
    defaultMessage: '进口清关',
  },
  exportDeclaration: {
    id: 'cms.delegation.export.declaration',
    defaultMessage: '出口清关',
  },
  all: {
    id: 'cms.delegation.stage.all',
    defaultMessage: '全部',
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
  declaringDelg: {
    id: 'cms.delegation.declaring',
    defaultMessage: '制单中',
  },
  delgInfo: {
    id: 'cms.delegation.delg.info',
    defaultMessage: '委托信息',
  },
  delgNo: {
    id: 'cms.delegation.delg.no',
    defaultMessage: '委托编号',
  },
  delgClient: {
    id: 'cms.delegation.delg.client',
    defaultMessage: '委托方',
  },
  delgTime: {
    id: 'cms.delegation.delg.time',
    defaultMessage: '委托日期',
  },
  acptTime: {
    id: 'cms.delegation.delg.acpttime',
    defaultMessage: '接单日期',
  },
  contractNo: {
    id: 'cms.delegation.delg.contract.no',
    defaultMessage: '合同号',
  },
  transMode: {
    id: 'cms.delegation.delg.trans_mode',
    defaultMessage: '运输方式',
  },
  deliveryNo: {
    id: 'cms.delegation.delg.delivery.no',
    defaultMessage: '提运单号',
  },
  invoiceNo: {
    id: 'cms.delegation.delg.invoice.no',
    defaultMessage: '发票号',
  },
  orderNo: {
    id: 'cms.delegation.delg.order.no',
    defaultMessage: '订单号',
  },
  voyageNo: {
    id: 'cms.delegation.delg.voyage.no',
    defaultMessage: '船名/航次',
  },
  delgInternalNo: {
    id: 'cms.delegation.delg.internal.no',
    defaultMessage: '外部编号',
  },
  preEntryNo: {
    id: 'cms.delegation.delg.preEntry.no',
    defaultMessage: '统一编号',
  },
  delgPieces: {
    id: 'cms.delegation.delg.pieces',
    defaultMessage: '总件数',
  },
  packageNum: {
    id: 'cms.delegation.delg.packageNum',
    defaultMessage: '件数',
  },
  delgWeight: {
    id: 'cms.delegation.delg.weight',
    defaultMessage: '总毛重',
  },
  delgGrossWt: {
    id: 'cms.delegation.delg.grosswt',
    defaultMessage: '毛重',
  },
  broker: {
    id: 'cms.delegation.delg.broker',
    defaultMessage: '申报企业',
  },
  goodsType: {
    id: 'cms.delegation.delg.goodstype',
    defaultMessage: '货物类型',
  },
  declareWay: {
    id: 'cms.delegation.delg.declareWay',
    defaultMessage: '报关类型',
  },
  manualNo: {
    id: 'cms.delegation.delg.manualNo',
    defaultMessage: '备案号',
  },
  status: {
    id: 'cms.delegation.delg.status',
    defaultMessage: '状态',
  },
  delgSource: {
    id: 'cms.delegation.delg.source',
    defaultMessage: '来源',
  },
  billNo: {
    id: 'cms.delegation.delg.billNo',
    defaultMessage: '清单编号',
  },
  compEntryId: {
    id: 'cms.delegation.delg.comp.entryId',
    defaultMessage: '企业报关单编号',
  },
  entryId: {
    id: 'cms.delegation.delg.entryId',
    defaultMessage: '报关单号',
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
    id: 'cms.delegation.delg.opColumn',
    defaultMessage: '操作',
  },
  modify: {
    id: 'cms.delegation.delg.modify',
    defaultMessage: '修改',
  },
  delete: {
    id: 'cms.delegation.delg.delete',
    defaultMessage: '删除',
  },
  deleteConfirm: {
    id: 'cms.delegation.delg.delete.confirm',
    defaultMessage: '确认删除？',
  },
  delgRecall: {
    id: 'cms.delegation.delg.recall',
    defaultMessage: '撤回',
  },
  delgDistribute: {
    id: 'cms.delegation.delg.distribute',
    defaultMessage: '分配',
  },
  downloadCert: {
    id: 'cms.delegation.delg.downloadCert',
    defaultMessage: '下载单据',
  },
  declareMake: {
    id: 'cms.delegation.make',
    defaultMessage: '制单',
  },
  declareView: {
    id: 'cms.delegation.view',
    defaultMessage: '查看',
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
  delgNew: {
    id: 'cms.delegation.delg.new',
    defaultMessage: '新建委托',
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
  addMore: {
    id: 'cms.delegation.addMore',
    defaultMessage: '添加清关业务',
  },
  lastActTime: {
    id: 'cms.delegation.last.act.time',
    defaultMessage: '最后更新时间',
  },
  clrStatus: {
    id: 'cms.delegation.clr.status',
    defaultMessage: '通关状态',
  },
  processDate: {
    id: 'cms.delegation.process.date',
    defaultMessage: '更新时间',
  },
  delgDispatch: {
    id: 'cms.delegation.delg.dispatch',
    defaultMessage: '分配报关委托',
  },
  dispatchTo: {
    id: 'cms.delegation.delg.dispatchTo',
    defaultMessage: '分配给: ',
  },
  dispatchMessage: {
    id: 'cms.delegation.message.dispatch',
    defaultMessage: '请选择报关供应商',
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
});
