import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  warehouse: {
    id: 'cms.settings.customer',
    defaultMessage: '仓库',
  },
  warehouseName: {
    id: 'cms.settings.customer.name',
    defaultMessage: '仓库名称',
  },
  warehouseCode: {
    id: 'cms.settings.customer.code',
    defaultMessage: '仓库代码',
  },
  isBonded: {
    id: 'cms.settings.customer.bonded',
    defaultMessage: '保税仓',
  },
  warehouseLocation: {
    id: 'cms.settings.customer.location',
    defaultMessage: '位置',
  },
  opColumn: {
    id: 'cms.settings.customer.opColumn',
    defaultMessage: '操作',
  },
  whseEdit: {
    id: 'cms.settings.customer.edit',
    defaultMessage: '修改',
  },
  whseAuth: {
    id: 'cms.settings.customer.auth',
    defaultMessage: '授权',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
