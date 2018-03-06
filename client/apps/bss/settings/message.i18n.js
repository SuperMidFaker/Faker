import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  settings: {
    id: 'bss.settings',
    defaultMessage: '设置',
  },
  preferences: {
    id: 'bss.settings.preferences',
    defaultMessage: '偏好设置',
  },
  prefPlugins: {
    id: 'bss.settings.preferences.plugins',
    defaultMessage: '应用插件',
  },
  prefAuditRule: {
    id: 'bss.settings.preferences.audit.rule',
    defaultMessage: '审核规则',
  },
  fees: {
    id: 'bss.settings.fees',
    defaultMessage: '费用',
  },
  feeItems: {
    id: 'bss.settings.fees.items',
    defaultMessage: '费用元素',
  },
  feeGroups: {
    id: 'bss.settings.fees.groups',
    defaultMessage: '费用分组',
  },
  newFeeGroup: {
    id: 'bss.settings.new.fees.groups',
    defaultMessage: '新建费用分组',
  },
  newFeeElement: {
    id: 'bss.settings.new.fees.element',
    defaultMessage: '新建费用元素',
  },
  groupsSearchTip: {
    id: 'bss.settings.fee.group.search',
    defaultMessage: '分组代码/分组名称',
  },
  elementsSearchTip: {
    id: 'bss.settings.fee.element.search',
    defaultMessage: '费用代码/费用名称',
  },
  newChildFeeElement: {
    id: 'bss.settings.new.child.fees.element',
    defaultMessage: '新建子费用元素',
  },
  exchangeRates: {
    id: 'bss.settings.exchange.rates',
    defaultMessage: '汇率',
  },
  taxRates: {
    id: 'bss.settings.tax.rates',
    defaultMessage: '税率',
  },
  extField2: {
    id: 'bss.settings.order.type.extfield2',
    defaultMessage: '扩展字段2',
  },
  extField3: {
    id: 'bss.settings.order.type.extfield3',
    defaultMessage: '扩展字段3',
  },
  extField4: {
    id: 'bss.settings.order.type.extfield4',
    defaultMessage: '扩展字段4',
  },
  extField5: {
    id: 'bss.settings.order.type.extfield5',
    defaultMessage: '扩展字段5',
  },
  extField6: {
    id: 'bss.settings.order.type.extfield6',
    defaultMessage: '扩展字段6',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
