import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  inventoryWarehouse: {
    id: 'scv.resources.warehouse',
    defaultMessage: '仓库设置',
  },
  warehouseName: {
    id: 'scv.resources.warehouse.name',
    defaultMessage: '仓库名称',
  },
  warehouseCode: {
    id: 'scv.resources.warehouse.code',
    defaultMessage: '仓库代码',
  },
  isBonded: {
    id: 'scv.resources.warehouse.bonded',
    defaultMessage: '保税仓',
  },
  warehouseOperator: {
    id: 'scv.resources.warehouse.operator',
    defaultMessage: '经营者',
  },
  warehouseLocation: {
    id: 'scv.resources.warehouse.location',
    defaultMessage: '位置',
  },
  opColumn: {
    id: 'scv.resources.warehouse.opColumn',
    defaultMessage: '操作',
  },
  whseEdit: {
    id: 'scv.resources.warehouse.edit',
    defaultMessage: '修改',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
