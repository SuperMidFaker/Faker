import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  purchaseOrders: {
    id: 'sof.purchase.orders',
    defaultMessage: '采购订单',
  },
  poNo: {
    id: 'sof.purchase.orders.poNo',
    defaultMessage: '采购订单号',
  },
  createInvoice: {
    id: 'sof.purchase.orders.create',
    defaultMessage: '新建采购订单',
  },
  customer: {
    id: 'sof.purchase.orders.customer',
    defaultMessage: '购买方',
  },
  customerCntry: {
    id: 'sof.purchase.orders.customer.cntry',
    defaultMessage: '购买方国别',
  },
  supplier: {
    id: 'sof.purchase.orders.supplier',
    defaultMessage: '供应商',
  },
  supplierCntry: {
    id: 'sof.purchase.orders.supplier.cntry',
    defaultMessage: '供应商国别',
  },
  trxnMode: {
    id: 'sof.purchase.orders.trxnMode',
    defaultMessage: '成交方式',
  },
  transMode: {
    id: 'sof.purchase.orders.transMode',
    defaultMessage: '运输方式',
  },
  productNo: {
    id: 'sof.purchase.orders.productNo',
    defaultMessage: '产品货号',
  },
  gName: {
    id: 'sof.purchase.orders.gName',
    defaultMessage: '产品名称',
  },
  virtualWhse: {
    id: 'sof.purchase.orders.virtualWhse',
    defaultMessage: '库别',
  },
  brand: {
    id: 'sof.purchase.orders.brand',
    defaultMessage: '品牌',
  },
  orderQty: {
    id: 'sof.purchase.orders.orderQty',
    defaultMessage: '订单数量',
  },
  unitPrice: {
    id: 'sof.purchase.orders.unitPrice',
    defaultMessage: '单价',
  },
  totalAmount: {
    id: 'sof.purchase.orders.totalAmount',
    defaultMessage: '总价',
  },
  currency: {
    id: 'sof.purchase.orders.currency',
    defaultMessage: '币制',
  },
  netWt: {
    id: 'sof.purchase.orders.netWt',
    defaultMessage: '净重',
  },
  wtUnit: {
    id: 'sof.purchase.orders.wtUnit',
    defaultMessage: '净重单位',
  },
  invoiceNo: {
    id: 'sof.purchase.orders.invoiceNo',
    defaultMessage: '关联发票号',
  },
  shippingDate: {
    id: 'sof.purchase.orders.shippingDate',
    defaultMessage: '发货日期',
  },
  searchPlaceholder: {
    id: 'sof.purchase.orders.searchPlaceholder',
    defaultMessage: '采购订单号',
  },
  batchImportPurchaseOrders: {
    id: 'sof.purchase.orders.batch.import',
    defaultMessage: '导入采购',
  },
  toShip: {
    id: 'sof.purchase.orders.status.to.ship',
    defaultMessage: '待发货',
  },
  partialShipped: {
    id: 'sof.purchase.orders.status.partial.shipped',
    defaultMessage: '部分发货',
  },
  shipped: {
    id: 'sof.purchase.orders.status.shipped',
    defaultMessage: '已发货',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
