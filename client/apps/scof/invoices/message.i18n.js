import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  invoices: {
    id: 'scof.invoices',
    defaultMessage: '商业发票',
  },
  invoiceNo: {
    id: 'scof.invoices.invoice.no',
    defaultMessage: '发票号',
  },
  invoiceDate: {
    id: 'scof.invoices.invoice.date',
    defaultMessage: '开票日期',
  },
  buyer: {
    id: 'scof.invoices.invoice.buyer',
    defaultMessage: '购买方',
  },
  selectBuyer: {
    id: 'scof.invoices.invoice.buyer.placeholder',
    defaultMessage: '请选择购买方',
  },
  seller: {
    id: 'scof.invoices.invoice.seller',
    defaultMessage: '销售方',
  },
  selectSeller: {
    id: 'scof.invoices.invoice.seller.placeholder',
    defaultMessage: '请选择销售方',
  },
  poNo: {
    id: 'scof.invoices.invoice.poNo',
    defaultMessage: '采购订单号',
  },
  packageAndNumber: {
    id: 'scof.invoices.invoice.packageAndnumber',
    defaultMessage: '包装/件数',
  },
  selectPackage: {
    id: 'scof.invoices.invoice.package.placeholder',
    defaultMessage: '选择包装方式',
  },
  grossWt: {
    id: 'scof.invoices.invoice.grossWt',
    defaultMessage: '总毛重',
  },
  tradeMode: {
    id: 'scof.invoices.invoice.tradeMode',
    defaultMessage: '成交方式',
  },
  totalQty: {
    id: 'scof.invoices.invoice.totalQty',
    defaultMessage: '总数量',
  },
  totalAmount: {
    id: 'scof.invoices.invoice.totalAmount',
    defaultMessage: '总金额',
  },
  totalNetWt: {
    id: 'scof.invoices.invoice.totalNetWt',
    defaultMessage: '总净重',
  },
  category: {
    id: 'scof.invoices.invoice.category',
    defaultMessage: '发票类别',
  },
  currency: {
    id: 'scof.invoices.invoice.currency',
    defaultMessage: '币制',
  },
  status: {
    id: 'scof.invoices.invoice.status',
    defaultMessage: '状态',
  },
  createInvoice: {
    id: 'scof.invoices.create',
    defaultMessage: '新建发票',
  },
  batchImportInvoices: {
    id: 'scof.invoices.batch.import',
    defaultMessage: '批量导入发票',
  },
  toShip: {
    id: 'scof.invoices.status.to.ship',
    defaultMessage: '待发货',
  },
  partialShipped: {
    id: 'scof.invoices.status.partial.shipped',
    defaultMessage: '部分发货',
  },
  shipped: {
    id: 'scof.invoices.status.shipped',
    defaultMessage: '已发货',
  },

});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
