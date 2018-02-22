import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  settings: {
    id: 'bss.settings',
    defaultMessage: '设置',
  },
  fees: {
    id: 'bss.settings.fee',
    defaultMessage: '费用参数',
  },
  feeItems: {
    id: 'bss.settings.fee.items',
    defaultMessage: '费用项',
  },
  feeGroups: {
    id: 'sof.settings.fee.groups',
    defaultMessage: '费用分组',
  },
  exchangeRates: {
    id: 'sof.settings.exchange.rates',
    defaultMessage: '汇率设置',
  },
  extField1: {
    id: 'sof.settings.order.type.extfield1',
    defaultMessage: '扩展字段1',
  },
  extField2: {
    id: 'sof.settings.order.type.extfield2',
    defaultMessage: '扩展字段2',
  },
  extField3: {
    id: 'sof.settings.order.type.extfield3',
    defaultMessage: '扩展字段3',
  },
  extField4: {
    id: 'sof.settings.order.type.extfield4',
    defaultMessage: '扩展字段4',
  },
  extField5: {
    id: 'sof.settings.order.type.extfield5',
    defaultMessage: '扩展字段5',
  },
  extField6: {
    id: 'sof.settings.order.type.extfield6',
    defaultMessage: '扩展字段6',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
