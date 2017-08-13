import { defineMessages } from 'react-intl';

const messages = defineMessages({
  ftzEntryReg: {
    id: 'cwm.supervision.shftz.entry.reg',
    defaultMessage: '进区备案',
  },
  ftzReleaseReg: {
    id: 'cwm.supervision.shftz.release.reg',
    defaultMessage: '出区备案',
  },
  ftzClearance: {
    id: 'cwm.supervision.shftz.clearance',
    defaultMessage: '普通出库清关',
  },
  ftzBatchDecl: {
    id: 'cwm.supervision.shftz.batch.decl',
    defaultMessage: '分拨集中报关',
  },
  ftzCargoReg: {
    id: 'cwm.supervision.shftz.cargo.reg',
    defaultMessage: '分拨货物备案',
  },
  entrySearchPlaceholder: {
    id: 'cms.supervision.shftz.entry.search.placeholder',
    defaultMessage: 'ANS编号/报关单号/海关入库单号',
  },
  releaseSearchPlaceholder: {
    id: 'cms.supervision.shftz.release.search.placeholder',
    defaultMessage: 'SO编号/报关单号/海关出库单号',
  },
  batchSearchPlaceholder: {
    id: 'cms.supervision.shftz.batch.search.placeholder',
    defaultMessage: '报关单号/海关出库单号',
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
    defaultMessage: '备案料号',
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
  createBatchDecl: {
    id: 'cwm.supervision.shftz.create.batchdecl',
    defaultMessage: '新建集中报关',
  },
  createClearance: {
    id: 'cwm.supervision.shftz.create.clearance',
    defaultMessage: '新建出库清关',
  },
});

export default messages;
