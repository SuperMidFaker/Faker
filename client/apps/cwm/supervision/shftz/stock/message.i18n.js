import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  owner: {
    id: 'cwm.supervision.shftz.stock.owner',
    defaultMessage: '货主',
  },
  billNo: {
    id: 'cwm.supervision.shftz.stock.billNo',
    defaultMessage: '海关进库单',
  },
  detailId: {
    id: 'cwm.supervision.shftz.stock.detailid',
    defaultMessage: '明细ID',
  },
  stockQty: {
    id: 'cwm.supervision.shftz.stock.stockQty',
    defaultMessage: '剩余数量',
  },
  qty: {
    id: 'cwm.supervision.shftz.stock.qty',
    defaultMessage: '申报数量',
  },
  money: {
    id: 'cwm.supervision.shftz.stock.money',
    defaultMessage: '金额',
  },
  gWeight: {
    id: 'cwm.supervision.shftz.stock.gWeight',
    defaultMessage: '毛重',
  },
  nWeight: {
    id: 'cwm.supervision.shftz.stock.nWeight',
    defaultMessage: '净重',
  },
  cQty: {
    id: 'cwm.supervision.shftz.stock.cQty',
    defaultMessage: '已出数量',
  },
  sQty: {
    id: 'cwm.supervision.shftz.stock.sQty',
    defaultMessage: '锁定数量',
  },
  location: {
    id: 'cwm.supervision.shftz.stock.location',
    defaultMessage: '库位',
  },
  tag: {
    id: 'cwm.supervision.shftz.stock.tag',
    defaultMessage: '标签',
  },
  orgCargoId: {
    id: 'cwm.supervision.shftz.stock.orgCargoId',
    defaultMessage: '备件号',
  },
  hsCode: {
    id: 'cwm.supervision.shftz.stock.hsCode',
    defaultMessage: '商品编码',
  },
  gName: {
    id: 'cwm.supervision.shftz.stock.gName',
    defaultMessage: '中文品名',
  },
  model: {
    id: 'cwm.supervision.shftz.stock.model',
    defaultMessage: '规格型号',
  },
  unit: {
    id: 'cwm.supervision.shftz.stock.unit',
    defaultMessage: '单位',
  },
  curr: {
    id: 'cwm.supervision.shftz.stock.curr',
    defaultMessage: '币别代码',
  },
  country: {
    id: 'cwm.supervision.shftz.stock.country',
    defaultMessage: '国家代码',
  },
  cargoType: {
    id: 'cwm.supervision.shftz.stock.cargoType',
    defaultMessage: '货物类型',
  },
  stockWeight: {
    id: 'cwm.supervision.shftz.stock.stockWeight',
    defaultMessage: '剩余净重',
  },
  cWeight: {
    id: 'cwm.supervision.shftz.stock.cWeight',
    defaultMessage: '已出净重',
  },
  sWeight: {
    id: 'cwm.supervision.shftz.stock.sWeight',
    defaultMessage: '锁定净重',
  },
  stockMoney: {
    id: 'cwm.supervision.shftz.stock.stockMoney',
    defaultMessage: '剩余金额',
  },
  cMoney: {
    id: 'cwm.supervision.shftz.stock.cMoney',
    defaultMessage: '已出金额',
  },
  sMoney: {
    id: 'cwm.supervision.shftz.stock.sMoney',
    defaultMessage: '锁定金额',
  },
  usdMoney: {
    id: 'cwm.supervision.shftz.stock.usdMoney',
    defaultMessage: '美元金额',
  },
  cusNo: {
    id: 'cwm.supervision.shftz.stock.cusNo',
    defaultMessage: '报关单号',
  },
  export: {
    id: 'cwm.supervision.shftz.stock.export',
    defaultMessage: '导出',
  },
  inquiry: {
    id: 'cwm.supervision.shftz.stock.inquiry',
    defaultMessage: '查询',
  },
  reset: {
    id: 'cwm.supervision.shftz.stock.reset',
    defaultMessage: '重置',
  },
  taskId: {
    id: 'cwm.supervision.shftz.stock.task.id',
    defaultMessage: '任务号',
  },
  progress: {
    id: 'cwm.supervision.shftz.stock.task.progress',
    defaultMessage: '进度',
  },
  createdDate: {
    id: 'cwm.supervision.shftz.stock.task.created.date',
    defaultMessage: '创建时间',
  },
  ftzStockQty: {
    id: 'cwm.supervision.shftz.stock.ftz.qty',
    defaultMessage: '海关数量',
  },
  whseStockQty: {
    id: 'cwm.supervision.shftz.stock.whse.qty',
    defaultMessage: '库存数量',
  },
  ftzNetWt: {
    id: 'cwm.supervision.shftz.stock.ftz.netwt',
    defaultMessage: '海关净重',
  },
  whseNetWt: {
    id: 'cwm.supervision.shftz.stock.whse.netwt',
    defaultMessage: '库存净重',
  },
  ftzAmount: {
    id: 'cwm.supervision.shftz.stock.ftz.amount',
    defaultMessage: '海关金额',
  },
  whseAmount: {
    id: 'cwm.supervision.shftz.stock.whse.amount',
    defaultMessage: '库存金额',
  },
  asnNo: {
    id: 'cwm.supervision.shftz.stock.asn.no',
    defaultMessage: 'ASN编号',
  },
  productNo: {
    id: 'cwm.supervision.shftz.stock.product.no',
    defaultMessage: '货号',
  },
  traceId: {
    id: 'cwm.supervision.shftz.stock.trace.id',
    defaultMessage: '追踪ID',
  },
  serialNo: {
    id: 'cwm.supervision.shftz.stock.serial',
    defaultMessage: '序列号',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
