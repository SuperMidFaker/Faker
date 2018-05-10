import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  invoices: {
    id: 'sof.invoices',
    defaultMessage: '商业发票',
  },
  invoiceNo: {
    id: 'sof.invoices.invoice.no',
    defaultMessage: '发票号',
  },
  invoiceDate: {
    id: 'sof.invoices.invoice.date',
    defaultMessage: '开票日期',
  },
  buyer: {
    id: 'sof.invoices.invoice.buyer',
    defaultMessage: '购买方',
  },
  selectBuyer: {
    id: 'sof.invoices.invoice.buyer.placeholder',
    defaultMessage: '请选择购买方',
  },
  seller: {
    id: 'sof.invoices.invoice.seller',
    defaultMessage: '销售方',
  },
  selectSeller: {
    id: 'sof.invoices.invoice.seller.placeholder',
    defaultMessage: '请选择销售方',
  },
  poNo: {
    id: 'sof.invoices.invoice.poNo',
    defaultMessage: '采购订单号',
  },
  packageAndNumber: {
    id: 'sof.invoices.invoice.packageAndnumber',
    defaultMessage: '包装/件数',
  },
  selectPackage: {
    id: 'sof.invoices.invoice.package.placeholder',
    defaultMessage: '选择包装方式',
  },
  grossWt: {
    id: 'sof.invoices.invoice.grossWt',
    defaultMessage: '总毛重',
  },
  tradeMode: {
    id: 'sof.invoices.invoice.tradeMode',
    defaultMessage: '成交方式',
  },
  totalQty: {
    id: 'sof.invoices.invoice.totalQty',
    defaultMessage: '总数量',
  },
  totalAmount: {
    id: 'sof.invoices.invoice.totalAmount',
    defaultMessage: '总金额',
  },
  totalNetWt: {
    id: 'sof.invoices.invoice.totalNetWt',
    defaultMessage: '总净重',
  },
  category: {
    id: 'sof.invoices.invoice.category',
    defaultMessage: '发票类别',
  },
  currency: {
    id: 'sof.invoices.invoice.currency',
    defaultMessage: '币制',
  },
  status: {
    id: 'sof.invoices.invoice.status',
    defaultMessage: '状态',
  },
  createInvoice: {
    id: 'sof.invoices.create',
    defaultMessage: '新建发票',
  },
  batchImportInvoices: {
    id: 'sof.invoices.batch.import',
    defaultMessage: '批量导入发票',
  },
  toShip: {
    id: 'sof.invoices.status.to.ship',
    defaultMessage: '待发货',
  },
  partialShipped: {
    id: 'sof.invoices.status.partial.shipped',
    defaultMessage: '部分发货',
  },
  shipped: {
    id: 'sof.invoices.status.shipped',
    defaultMessage: '已发货',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
