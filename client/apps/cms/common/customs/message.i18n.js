import { defineMessages } from 'react-intl';

export default defineMessages({
  customsDeclaration: {
    id: 'cms.customs.management',
    defaultMessage: '报关单管理',
  },
  searchPlaceholder: {
    id: 'cms.customs.search.placeholder',
    defaultMessage: '海关编号/预报关编号/委托编号',
  },
  importOperation: {
    id: 'cms.customs.import.operation',
    defaultMessage: '进口申报',
  },
  exportOperation: {
    id: 'cms.customs.export.operation',
    defaultMessage: '出口申报',
  },
  declCDF: {
    id: 'cms.customs.decl.cdf',
    defaultMessage: '报关单',
  },
  declFTZ: {
    id: 'cms.customs.decl.ftz',
    defaultMessage: '备案清单',
  },
  declNo: {
    id: 'cms.customs.decl.no',
    defaultMessage: '报关单号',
  },
  entryId: {
    id: 'cms.customs.decl.entryId',
    defaultMessage: '海关编号',
  },
  createDecl: {
    id: 'cms.customs.decl.create',
    defaultMessage: '新建报关单',
  },
  delgNo: {
    id: 'cms.customs.delg.no',
    defaultMessage: '委托编号',
  },
  billNo: {
    id: 'cms.customs.bill.no',
    defaultMessage: '清单编号',
  },
  preEntryNo: {
    id: 'cms.customs.decl.preentry.no',
    defaultMessage: '预报关编号',
  },
  clrStatus: {
    id: 'cms.customs.decl.status',
    defaultMessage: '通关状态',
  },
  declType: {
    id: 'cms.customs.decl.declType',
    defaultMessage: '单证类型',
  },
  easipassList: {
    id: 'cms.customs.decl.easipassList',
    defaultMessage: 'EDI列表',
  },
  sendDecl: {
    id: 'cms.customs.decl.sendModal.sendDecl',
    defaultMessage: '发送报关单',
  },
  agent: {
    id: 'cms.customs.agent',
    defaultMessage: '申报单位',
  },
  status: {
    id: 'cms.customs.delg.status',
    defaultMessage: '状态',
  },
  opColumn: {
    id: 'cms.customs.opColumn',
    defaultMessage: '操作',
  },
  entryNoFillModalTitle: {
    id: 'cms.customs.modal.entrynofill.title',
    defaultMessage: '回填海关编号',
  },
  customsClearModalTitle: {
    id: 'cms.customs.modal.clear.title',
    defaultMessage: '标记报关单放行',
  },
  successfulOperation: {
    id: 'cms.customs.modal.successful.operation',
    defaultMessage: '操作成功',
  },
  save: {
    id: 'cms.customs.save',
    defaultMessage: '保存',
  },
  processDate: {
    id: 'cms.customs.process.date',
    defaultMessage: '更新时间',
  },
  customsCheck: {
    id: 'cms.customs.check',
    defaultMessage: '海关查验',
  },
  all: {
    id: 'cms.customs.filter.all',
    defaultMessage: '全部',
  },
  filterProposed: {
    id: 'cms.customs.filter.proposed',
    defaultMessage: '报关建议书',
  },
  filterReviewed: {
    id: 'cms.customs.filter.reviewed',
    defaultMessage: '已复核',
  },
  filterDeclared: {
    id: 'cms.customs.filter.declared',
    defaultMessage: '已发送',
  },
  filterFinalized: {
    id: 'cms.customs.filter.finalized',
    defaultMessage: '已回执',
  },
  customsReleased: {
    id: 'cms.customs.status.released',
    defaultMessage: '已放行',
  },
  deleteConfirm: {
    id: 'cms.customs.delete.confirm',
    defaultMessage: '确认删除该报关单?',
  },
  delete: {
    id: 'cms.customs.delete',
    defaultMessage: '删除',
  },
  review: {
    id: 'cms.customs.filter.review',
    defaultMessage: '复核',
  },
  recall: {
    id: 'cms.customs.recall',
    defaultMessage: '退回',
  },
  send: {
    id: 'cms.customs.send',
    defaultMessage: '发送',
  },
  sendPackets: {
    id: 'cms.customs.send.packets',
    defaultMessage: '发送报文',
  },
  markReleased: {
    id: 'cms.customs.mark.released',
    defaultMessage: '标记放行',
  },
  preEntryId: {
    id: 'cms.customs.form.pre.entry.id',
    defaultMessage: '预录入编号',
  },
  formEntryId: {
    id: 'cms.customs.form.entry.id',
    defaultMessage: '海关编号',
  },
  forwardName: {
    id: 'cms.customs.form.forward.name',
    defaultMessage: '收发货人',
  },
  ownerConsumeName: {
    id: 'cms.customs.form.owner.consume.name',
    defaultMessage: '消费使用单位',
  },
  ownerProduceName: {
    id: 'cms.customs.form.owner.produce.name',
    defaultMessage: '生产消费单位',
  },
  agentName: {
    id: 'cms.customs.form.agent.name',
    defaultMessage: '申报单位',
  },
  certMark: {
    id: 'cms.customs.form.cert.mark',
    defaultMessage: '随附单证',
  },
  markNotes: {
    id: 'cms.customs.form.mark.notes',
    defaultMessage: '唛码备注',
  },
  seqNumber: {
    id: 'cms.customs.table.seq.number',
    defaultMessage: '序号',
  },
  copGNo: {
    id: 'cms.customs.table.cop.gno',
    defaultMessage: '商品货号',
  },
  emGNo: {
    id: 'cms.customs.table.em.gno',
    defaultMessage: '项号',
  },
  codeT: {
    id: 'cms.customs.table.codet',
    defaultMessage: '商品编码',
  },
  codeS: {
    id: 'cms.customs.table.codes',
    defaultMessage: '附加码',
  },
  gName: {
    id: 'cms.customs.table.gname',
    defaultMessage: '商品名称',
  },
  gModel: {
    id: 'cms.customs.table.gmodel',
    defaultMessage: '规格型号',
  },
  element: {
    id: 'cms.customs.table.element',
    defaultMessage: '申报要素',
  },
  quantity: {
    id: 'cms.customs.table.quantity',
    defaultMessage: '申报数量',
  },
  unit: {
    id: 'cms.customs.table.unit',
    defaultMessage: '成交单位',
  },
  icountry: {
    id: 'cms.customs.table.icountry',
    defaultMessage: '原产国',
  },
  ecountry: {
    id: 'cms.customs.table.ecountry',
    defaultMessage: '最终目的国',
  },
  decPrice: {
    id: 'cms.customs.table.dec.price',
    defaultMessage: '单价',
  },
  decTotal: {
    id: 'cms.customs.table.dec.total',
    defaultMessage: '总价',
  },
  currency: {
    id: 'cms.customs.table.currency',
    defaultMessage: '币制',
  },
  exemptionWay: {
    id: 'cms.customs.table.exemptionway',
    defaultMessage: '征免方式',
  },
  sendAllPackets: {
    id: 'cms.customs.send.all.packets',
    defaultMessage: '批量发送报文',
  },
  trafMode: {
    id: 'cms.customs.traf.mode',
    defaultMessage: '运输方式',
  },
});
