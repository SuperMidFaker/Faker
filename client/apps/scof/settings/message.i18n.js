import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  settings: {
    id: 'scof.settings',
    defaultMessage: '设置',
  },
  preferences: {
    id: 'sof.order.preference',
    defaultMessage: '参数设定',
  },
  orderParams: {
    id: 'scof.settings.order.params',
    defaultMessage: '订单参数',
  },
  orderTypes: {
    id: 'scof.settings.order.types',
    defaultMessage: '订单类型',
  },
  exceptionCode: {
    id: 'scof.settings.order.exception.code',
    defaultMessage: '异常原因',
  },
  config: {
    id: 'scof.settings.config',
    defaultMessage: '配置',
  },
  orderConfig: {
    id: 'scof.settings.order.config',
    defaultMessage: '订单类型配置',
  },
  orderTypeInfo: {
    id: 'sof.settings.order.type.info',
    defaultMessage: '订单类型信息',
  },
  orderTransfer: {
    id: 'sof.settings.order.type.transfer',
    defaultMessage: '订单流向',
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
