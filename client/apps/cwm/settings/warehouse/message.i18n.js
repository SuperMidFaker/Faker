import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  warehouse: {
    id: 'cwm.settings.warehouse',
    defaultMessage: '仓库',
  },
  warehouseName: {
    id: 'cwm.settings.warehouse.name',
    defaultMessage: '仓库名称',
  },
  warehouseCode: {
    id: 'cwm.settings.warehouse.code',
    defaultMessage: '仓库代码',
  },
  isBonded: {
    id: 'cwm.settings.warehouse.bonded',
    defaultMessage: '保税仓',
  },
  warehouseLocation: {
    id: 'cwm.settings.warehouse.location',
    defaultMessage: '位置',
  },
  opColumn: {
    id: 'cwm.settings.warehouse.opColumn',
    defaultMessage: '操作',
  },
  whseEdit: {
    id: 'cwm.settings.warehouse.edit',
    defaultMessage: '修改',
  },
  whseAuth: {
    id: 'cwm.settings.warehouse.auth',
    defaultMessage: '授权',
  },
  warehousePlaceholder: {
    id: 'cwm.settings.warehouse.wh.placeholder',
    defaultMessage: '仓库查找',
  },
  locationPh: {
    id: 'cwm.settings.warehouse.location.placeholder',
    defaultMessage: '库位编码',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
