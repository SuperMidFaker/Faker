import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  customsDecl: {
    id: 'cms.customs.decl',
    defaultMessage: '报关申报',
  },
  import: {
    id: 'cms.customs.decl.import',
    defaultMessage: '进口',
  },
  export: {
    id: 'cms.customs.decl.export',
    defaultMessage: '出口',
  },
  searchPlaceholder: {
    id: 'cms.customs.decl.search.placeholder',
    defaultMessage: '报关单号/委托编号/客户单号',
  },
  declCDF: {
    id: 'cms.customs.decl.decl.cdf',
    defaultMessage: '报关单',
  },
  declFTZ: {
    id: 'cms.customs.decl.decl.ftz',
    defaultMessage: '备案清单',
  },
  orderNo: {
    id: 'cms.customs.decl.order.no',
    defaultMessage: '客户单号',
  },
  declNo: {
    id: 'cms.customs.decl.decl.no',
    defaultMessage: '报关单号/内部编号',
  },
  entryId: {
    id: 'cms.customs.decl.decl.entryId',
    defaultMessage: '海关编号',
  },
  createDecl: {
    id: 'cms.customs.decl.decl.create',
    defaultMessage: '新建报关单',
  },
  delgNo: {
    id: 'cms.customs.decl.delg.no',
    defaultMessage: '委托编号',
  },
  billNo: {
    id: 'cms.customs.decl.bill.no',
    defaultMessage: '清单编号',
  },
  preEntryNo: {
    id: 'cms.customs.decl.decl.preentry.no',
    defaultMessage: '统一编号',
  },
  clrStatus: {
    id: 'cms.customs.decl.decl.status',
    defaultMessage: '通关状态',
  },
  declChannel: {
    id: 'cms.customs.decl.channel',
    defaultMessage: '申报通道',
  },
  declType: {
    id: 'cms.customs.decl.type',
    defaultMessage: '单证类型',
  },
  easipassList: {
    id: 'cms.customs.decl.easipass.list',
    defaultMessage: 'EDI列表',
  },
  quickpassList: {
    id: 'cms.customs.decl.quickpass.list',
    defaultMessage: 'QP列表',
  },
  sendDecl: {
    id: 'cms.customs.decl.decl.sendModal.sendDecl',
    defaultMessage: '发送报关报文',
  },
  agent: {
    id: 'cms.customs.decl.agent',
    defaultMessage: '申报单位',
  },
  status: {
    id: 'cms.customs.decl.delg.status',
    defaultMessage: '状态',
  },
  opColumn: {
    id: 'cms.customs.decl.op.col',
    defaultMessage: '操作',
  },
  entryNoFillModalTitle: {
    id: 'cms.customs.decl.modal.entrynofill.title',
    defaultMessage: '回填海关编号',
  },
  customsClearModalTitle: {
    id: 'cms.customs.decl.modal.clear.title',
    defaultMessage: '报关单放行确认',
  },
  successfulOperation: {
    id: 'cms.customs.decl.modal.successful.operation',
    defaultMessage: '操作成功',
  },
  processDate: {
    id: 'cms.customs.decl.process.date',
    defaultMessage: '更新时间',
  },
  customsCheck: {
    id: 'cms.customs.decl.check',
    defaultMessage: '海关查验',
  },
  all: {
    id: 'cms.customs.decl.filter.all',
    defaultMessage: '全部',
  },
  filterProposed: {
    id: 'cms.customs.decl.filter.proposed',
    defaultMessage: '报关建议书',
  },
  filterReviewed: {
    id: 'cms.customs.decl.filter.reviewed',
    defaultMessage: '已复核',
  },
  filterDeclared: {
    id: 'cms.customs.decl.filter.declared',
    defaultMessage: '已发送',
  },
  filterFinalized: {
    id: 'cms.customs.decl.filter.entered',
    defaultMessage: '已回执',
  },
  customsReleased: {
    id: 'cms.customs.decl.status.released',
    defaultMessage: '已放行',
  },
  deleteConfirm: {
    id: 'cms.customs.decl.delete.confirm',
    defaultMessage: '确定删除该报关单?',
  },
  recallConfirm: {
    id: 'cms.customs.decl.recall.confirm',
    defaultMessage: '确定取消报关单复核?',
  },
  delete: {
    id: 'cms.customs.decl.delete',
    defaultMessage: '删除',
  },
  review: {
    id: 'cms.customs.decl.filter.review',
    defaultMessage: '复核',
  },
  recall: {
    id: 'cms.customs.decl.recall',
    defaultMessage: '退回',
  },
  send: {
    id: 'cms.customs.decl.send',
    defaultMessage: '发送',
  },
  sendDeclMsg: {
    id: 'cms.customs.decl.send.decl.msg',
    defaultMessage: '申报',
  },
  markReleased: {
    id: 'cms.customs.decl.mark.released',
    defaultMessage: '放行确认',
  },
  viewDeclMsg: {
    id: 'cms.customs.decl.view.decl',
    defaultMessage: '查看申报报文',
  },
  viewResultMsg: {
    id: 'cms.customs.decl.view.result',
    defaultMessage: '查看回执报文',
  },
  preEntryId: {
    id: 'cms.customs.decl.form.pre.entry.id',
    defaultMessage: '预录入编号',
  },
  formEntryId: {
    id: 'cms.customs.decl.form.entry.id',
    defaultMessage: '海关编号',
  },
  forwardName: {
    id: 'cms.customs.decl.form.forward.name',
    defaultMessage: '收发货人',
  },
  ownerConsumeName: {
    id: 'cms.customs.decl.form.owner.consume.name',
    defaultMessage: '消费使用单位',
  },
  ownerProduceName: {
    id: 'cms.customs.decl.form.owner.produce.name',
    defaultMessage: '生产消费单位',
  },
  agentName: {
    id: 'cms.customs.decl.form.agent.name',
    defaultMessage: '申报单位',
  },
  certMark: {
    id: 'cms.customs.decl.form.cert.mark',
    defaultMessage: '随附单证：',
  },
  markNotes: {
    id: 'cms.customs.decl.form.mark.notes',
    defaultMessage: '唛码备注：',
  },
  seqNo: {
    id: 'cms.customs.decl.table.seq.no',
    defaultMessage: '序号',
  },
  copGNo: {
    id: 'cms.customs.decl.table.cop.gno',
    defaultMessage: '商品货号',
  },
  emGNo: {
    id: 'cms.customs.decl.table.em.gno',
    defaultMessage: '项号',
  },
  hscode: {
    id: 'cms.customs.decl.table.hscode',
    defaultMessage: 'HS编码',
  },
  codeT: {
    id: 'cms.customs.decl.table.codet',
    defaultMessage: '商品编码',
  },
  codeS: {
    id: 'cms.customs.decl.table.codes',
    defaultMessage: '附加码',
  },
  gName: {
    id: 'cms.customs.decl.table.gname',
    defaultMessage: '商品名称',
  },
  gModel: {
    id: 'cms.customs.decl.table.gmodel',
    defaultMessage: '规格型号',
  },
  element: {
    id: 'cms.customs.decl.table.element',
    defaultMessage: '申报要素',
  },
  quantity: {
    id: 'cms.customs.decl.table.quantity',
    defaultMessage: '申报数量',
  },
  unit: {
    id: 'cms.customs.decl.table.unit',
    defaultMessage: '成交单位',
  },
  origCountry: {
    id: 'cms.customs.decl.table.origCountry',
    defaultMessage: '原产国',
  },
  destCountry: {
    id: 'cms.customs.decl.table.destCountry',
    defaultMessage: '最终目的国',
  },
  decPrice: {
    id: 'cms.customs.decl.table.dec.price',
    defaultMessage: '申报单价',
  },
  decTotal: {
    id: 'cms.customs.decl.table.dec.total',
    defaultMessage: '申报总价',
  },
  currency: {
    id: 'cms.customs.decl.table.currency',
    defaultMessage: '币制',
  },
  exemptionWay: {
    id: 'cms.customs.decl.table.exemptionway',
    defaultMessage: '征免方式',
  },
  sendAllPackets: {
    id: 'cms.customs.decl.send.all.packets',
    defaultMessage: '批量发送申报',
  },
  trafMode: {
    id: 'cms.customs.decl.traf.mode',
    defaultMessage: '运输方式',
  },
  packCount: {
    id: 'cms.customs.decl.pack.count',
    defaultMessage: '件数',
  },
  packType: {
    id: 'cms.customs.decl.pack.type',
    defaultMessage: '包装种类',
  },
  grossWt: {
    id: 'cms.customs.decl.gross.wt',
    defaultMessage: '毛重',
  },
  contractNo: {
    id: 'cms.customs.decl.contract.no',
    defaultMessage: '合同协议号',
  },
  containerId: {
    id: 'cms.customs.decl.tabpanes.container.id',
    defaultMessage: '箱号',
  },
  containerWt: {
    id: 'cms.customs.decl.tabpanes.container.wt',
    defaultMessage: '自重',
  },
  containerSpec: {
    id: 'cms.customs.decl.tabpanes.container.spec',
    defaultMessage: '规格',
  },
  containerQty: {
    id: 'cms.customs.decl.tabpanes.container.qty',
    defaultMessage: '数量',
  },
  docuSpec: {
    id: 'cms.customs.decl.tabpanes.document.spec',
    defaultMessage: '单据类型',
  },
  docuCode: {
    id: 'cms.customs.decl.tabpanes.document.code',
    defaultMessage: '单据编码',
  },
  certSpec: {
    id: 'cms.customs.decl.tabpanes.cert.spec',
    defaultMessage: '单证类型',
  },
  certNum: {
    id: 'cms.customs.decl.tabpanes.cert.num',
    defaultMessage: '单证编号',
  },
  exchangeRate: {
    id: 'cms.customs.decl.tabpanes.tax.exchange.rate',
    defaultMessage: '汇率',
  },
  viewProposal: {
    id: 'cms.customs.decl.op.view.proposal',
    defaultMessage: '报关建议书',
  },
  viewCCD: {
    id: 'cms.customs.decl.op.view.ccd',
    defaultMessage: '报关单',
  },
  save: {
    id: 'cms.customs.decl.save',
    defaultMessage: '保存',
  },
  estimate: {
    id: 'cms.customs.decl.estimate',
    defaultMessage: '估算',
  },
  declMod: {
    id: 'cms.customs.decl.mod',
    defaultMessage: '修撤单',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
