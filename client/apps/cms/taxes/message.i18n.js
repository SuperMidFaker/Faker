import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  permit: {
    id: 'cms.taxes',
    defaultMessage: '税金管理',
  },
  all: {
    id: 'cms.taxes.filter.all',
    defaultMessage: '全部',
  },
  batchImportTaxes: {
    id: 'cms.taxes.batchImportTaxes',
    defaultMessage: '批量导入税金',
  },
  searchPlaceholder: {
    id: 'cms.taxes.searchPlaceholder',
    defaultMessage: '报关单号/提运单号/内部编号',
  },
  preEntrySeqNo: {
    id: 'cms.taxes.preEntrySeqNo',
    defaultMessage: '报关单号',
  },
  blWbNo: {
    id: 'cms.taxes.blWbNo',
    defaultMessage: '提运单号',
  },
  trxnMode: {
    id: 'cms.taxes.trxnMode',
    defaultMessage: '成交方式',
  },
  shipFee: {
    id: 'cms.taxes.shipFee',
    defaultMessage: '运费',
  },
  otherFee: {
    id: 'cms.taxes.otherFee',
    defaultMessage: '杂费',
  },
  insurFee: {
    id: 'cms.taxes.insurFee',
    defaultMessage: '保险费',
  },
  shipMark: {
    id: 'cms.taxes.shipMark',
    defaultMessage: '运费类型',
  },
  otherMark: {
    id: 'cms.taxes.otherMark',
    defaultMessage: '杂费类型',
  },
  insurMark: {
    id: 'cms.taxes.insurMark',
    defaultMessage: '保费类型',
  },
  tradeTot: {
    id: 'cms.taxes.tradeTot',
    defaultMessage: '申报总价',
  },
  dutyPaid: {
    id: 'cms.taxes.dutyPaid',
    defaultMessage: '完税价格',
  },
  dutyRate: {
    id: 'cms.taxes.dutyRate',
    defaultMessage: '关税税率',
  },
  dutyTax: {
    id: 'cms.taxes.dutyTax',
    defaultMessage: '关税',
  },
  gstRates: {
    id: 'cms.taxes.gstRates',
    defaultMessage: '消费税率',
  },
  exciseTax: {
    id: 'cms.taxes.exciseTax',
    defaultMessage: '消费税',
  },
  vatRates: {
    id: 'cms.taxes.exciseTax',
    defaultMessage: '增值税率',
  },
  vatTax: {
    id: 'cms.taxes.vatTax',
    defaultMessage: '增值税',
  },
  totalTax: {
    id: 'cms.taxes.totalTax',
    defaultMessage: '总税费',
  },
  gName: {
    id: 'cms.taxes.gName',
    defaultMessage: '商品名称',
  },
  actualDutyPaid: {
    id: 'cms.taxes.actualDutyPaid',
    defaultMessage: '实际完税价格',
  },
  actualDutyTax: {
    id: 'cms.taxes.actualDutyTax',
    defaultMessage: '实际关税',
  },
  actualVatTax: {
    id: 'cms.taxes.actualVatTax',
    defaultMessage: '进口增值税',
  },
  actualExciseTax: {
    id: 'cms.taxes.actualExciseTax',
    defaultMessage: '进口消费税',
  },
  deposit: {
    id: 'cms.taxes.deposit',
    defaultMessage: '保证金',
  },
  delayedDeclarationFee: {
    id: 'cms.taxes.delayedDeclarationFee',
    defaultMessage: '滞报金',
  },
  specialDutyTax: {
    id: 'cms.taxes.specialDutyTax',
    defaultMessage: '特别关税',
  },
  counterVailingDuty: {
    id: 'cms.taxes.counterVailingDuty',
    defaultMessage: '反补贴税',
  },
  discardTax: {
    id: 'cms.taxes.discardTax',
    defaultMessage: '废弃基金税',
  },
  dutyTaxInterest: {
    id: 'cms.taxes.dutyTaxInterest',
    defaultMessage: '关税缓息',
  },
  exciseTaxInterest: {
    id: 'cms.taxes.exciseTaxInterest',
    defaultMessage: '消费税缓息',
  },
  payerEntity: {
    id: 'cms.taxes.payerEntity',
    defaultMessage: '缴款单位',
  },
  paidDate: {
    id: 'cms.taxes.paidDate',
    defaultMessage: '支付日期',
  },
  origCountry: {
    id: 'cms.taxes.origCountry',
    defaultMessage: '原产国',
  },
  tradeTotal: {
    id: 'cms.taxes.tradeTotal',
    defaultMessage: '申报总价',
  },
  currency: {
    id: 'cms.taxes.currency',
    defaultMessage: '币制',
  },
  exchangeRate: {
    id: 'cms.taxes.exchangeRate',
    defaultMessage: '汇率',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);

