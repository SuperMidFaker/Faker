import { defineMessages } from 'react-intl';

const messages = defineMessages({
  ftzEntryReg: {
    id: 'cwm.supervision.shftz.entry.reg',
    defaultMessage: '进库备案',
  },
  ftzReleaseReg: {
    id: 'cwm.supervision.shftz.release.reg',
    defaultMessage: '出库备案',
  },
  ftzBatchReg: {
    id: 'cwm.supervision.shftz.batch.reg',
    defaultMessage: '集中报关申请',
  },
  ftzCargoReg: {
    id: 'cwm.supervision.shftz.cargo.reg',
    defaultMessage: '货物备案',
  },
  searchPlaceholder: {
    id: 'cms.supervision.shftz.search.placeholder',
    defaultMessage: 'ANS编号/海关编号/监管入库单号',
  },
  ownerSearchPlaceholder: {
    id: 'cms.supervision.shftz.owner.search.placeholder',
    defaultMessage: '货主海关编码/货主名称',
  },
  productSearchPlaceholder: {
    id: 'cms.supervision.shftz.product.cargo.search.placeholder',
    defaultMessage: '产品货号/产品SKU/原始备件号',
  },
  productNo: {
    id: 'cwm.supervision.shftz.cargo.product.no',
    defaultMessage: '产品货号',
  },
  productSku: {
    id: 'cwm.supervision.shftz.cargo.product.sku',
    defaultMessage: '产品SKU',
  },
  ftzCargoNo: {
    id: 'cwm.supervision.shftz.cargo.orig.no',
    defaultMessage: '原始备件号',
  },
  hscode: {
    id: 'cwm.supervision.shftz.cargo.hscode',
    defaultMessage: '商品编码',
  },
  gname: {
    id: 'cwm.supervision.shftz.cargo.gname',
    defaultMessage: '品名',
  },
  unit: {
    id: 'cwm.supervision.shftz.cargo.unit',
    defaultMessage: '单位',
  },
  country: {
    id: 'cwm.supervision.shftz.cargo.country',
    defaultMessage: '国别',
  },
  currency: {
    id: 'cwm.supervision.shftz.cargo.currency',
    defaultMessage: '币制',
  },
  cargoType: {
    id: 'cwm.supervision.shftz.cargo.type',
    defaultMessage: '货物类型',
  },
  opColumn: {
    id: 'cwm.supervision.shftz.opColumn',
    defaultMessage: '操作',
  },
});

export default messages;
