import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  warehouse: {
    id: 'cwm.resources.warehouse',
    defaultMessage: '仓库',
  },
  warehouseName: {
    id: 'cwm.resources.warehouse.name',
    defaultMessage: '仓库名称',
  },
  warehouseCode: {
    id: 'cwm.resources.warehouse.code',
    defaultMessage: '仓库代码',
  },
  isBonded: {
    id: 'cwm.resources.warehouse.bonded',
    defaultMessage: '保税仓',
  },
  warehouseLocation: {
    id: 'cwm.resources.warehouse.location',
    defaultMessage: '位置',
  },
  opColumn: {
    id: 'cwm.resources.warehouse.opColumn',
    defaultMessage: '操作',
  },
  whseEdit: {
    id: 'cwm.resources.warehouse.edit',
    defaultMessage: '修改',
  },
  whseAuth: {
    id: 'cwm.resources.warehouse.auth',
    defaultMessage: '授权',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
