import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inventoryWarehouse: {
    id: 'scv.inventory.warehouse',
    defaultMessage: '仓库设置',
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
  warehouseOperator: {
    id: 'cwm.resources.warehouse.operator',
    defaultMessage: '经营者',
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
});

export default messages;
export const formatMsg = formati18n(messages);
