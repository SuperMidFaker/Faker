import { defineMessages } from 'react-intl';

const messages = defineMessages({
  ftzBondedEntryReg: {
    id: 'cwm.supervision.shftz.bonded.entry.reg',
    defaultMessage: '进境入库备案',
  },
  ftzRelNormalReg: {
    id: 'cwm.supervision.shftz.release.normal',
    defaultMessage: '普通出库备案',
  },
  ftzNormalDecl: {
    id: 'cwm.supervision.shftz.normal.decl',
    defaultMessage: '普通出库报关',
  },
  ftzRelPortionReg: {
    id: 'cwm.supervision.shftz.release.portion',
    defaultMessage: '分拨出库备案',
  },
  ftzBatchDecl: {
    id: 'cwm.supervision.shftz.batch.decl',
    defaultMessage: '分拨集中报关',
  },
  ftzTransferIn: {
    id: 'cwm.supervision.shftz.transfer.in',
    defaultMessage: '区内移库转入',
  },
  ftzTransferOut: {
    id: 'cwm.supervision.shftz.transfer.out',
    defaultMessage: '区内移库转出',
  },
  ftzTransferSelf: {
    id: 'cwm.supervision.shftz.transfer.self',
    defaultMessage: '内部移库',
  },
  ftzBondedStock: {
    id: 'cwm.supervision.shftz.bonded.stock',
    defaultMessage: '保税库存',
  },
  ftzNonbondedStock: {
    id: 'cwm.supervision.shftz.nonbonded.stock',
    defaultMessage: '非保监管库存',
  },
  ftzCargoReg: {
    id: 'cwm.supervision.shftz.cargo.reg',
    defaultMessage: '分拨货物备案',
  },
  entrySearchPlaceholder: {
    id: 'cms.supervision.shftz.entry.search.placeholder',
    defaultMessage: 'ASN编号/报关单号/海关进库单号',
  },
  releaseSearchPlaceholder: {
    id: 'cms.supervision.shftz.release.search.placeholder',
    defaultMessage: 'SO编号/报关单号/海关出库单号',
  },
  normalSearchPlaceholder: {
    id: 'cms.supervision.shftz.normal.search.placeholder',
    defaultMessage: '委托单号',
  },
  batchSearchPlaceholder: {
    id: 'cms.supervision.shftz.batch.search.placeholder',
    defaultMessage: '报关单号/申请单号',
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
  create: {
    id: 'cwm.supervision.shftz.create',
    defaultMessage: '新建',
  },
});

export default messages;
