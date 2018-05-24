import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  settings: {
    id: 'paas.prefs',
    defaultMessage: '设置',
  },
  orderParams: {
    id: 'paas.prefs.order.params',
    defaultMessage: '参数',
  },
  shipmentTypes: {
    id: 'paas.prefs.order.types',
    defaultMessage: '货运类型',
  },
  fees: {
    id: 'paas.prefs.fees',
    defaultMessage: '费用',
  },
  feeItems: {
    id: 'paas.prefs.fees.items',
    defaultMessage: '费用元素',
  },
  feeGroups: {
    id: 'paas.prefs.fees.groups',
    defaultMessage: '费用分组',
  },
  newFeeGroup: {
    id: 'paas.prefs.new.fees.groups',
    defaultMessage: '新建费用分组',
  },
  newFeeElement: {
    id: 'paas.prefs.new.fees.element',
    defaultMessage: '新建费用元素',
  },
  groupsSearchTip: {
    id: 'paas.prefs.fee.group.search',
    defaultMessage: '分组代码/分组名称',
  },
  elementsSearchTip: {
    id: 'paas.prefs.fee.element.search',
    defaultMessage: '费用代码/费用名称',
  },
  newChildFeeElement: {
    id: 'paas.prefs.new.child.fees.element',
    defaultMessage: '新建子费用元素',
  },
  exchangeRates: {
    id: 'paas.prefs.exchange.rates',
    defaultMessage: '汇率',
  },
  addChangeRate: {
    id: 'paas.prefs.exchange.rate.add',
    defaultMessage: '添加汇率',
  },
  taxRates: {
    id: 'paas.prefs.tax.rates',
    defaultMessage: '税率',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
