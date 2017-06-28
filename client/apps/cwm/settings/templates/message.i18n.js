import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  warehouse: {
    id: 'cwm.settings.templates',
    defaultMessage: '仓库',
  },
  warehouseName: {
    id: 'cwm.settings.templates.name',
    defaultMessage: '仓库名称',
  },
  warehouseCode: {
    id: 'cwm.settings.templates.code',
    defaultMessage: '仓库代码',
  },
  isBonded: {
    id: 'cwm.settings.templates.bonded',
    defaultMessage: '保税仓',
  },
  warehouseLocation: {
    id: 'cwm.settings.templates.location',
    defaultMessage: '位置',
  },
  opColumn: {
    id: 'cwm.settings.templates.opColumn',
    defaultMessage: '操作',
  },
  whseEdit: {
    id: 'cwm.settings.templates.edit',
    defaultMessage: '修改',
  },
  whseAuth: {
    id: 'cwm.settings.templates.auth',
    defaultMessage: '授权',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
