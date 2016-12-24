import { defineMessages } from 'react-intl';

const messages = defineMessages({
  tradeItemManagement: {
    id: 'cms.tradeitem.management',
    defaultMessage: '物料管理',
  },
  filterUnclassified: {
    id: 'cms.tradeitem.filter.unclassified',
    defaultMessage: '未归类',
  },
  filterPending: {
    id: 'cms.tradeitem.filter.pending',
    defaultMessage: '未审核',
  },
  filterClassified: {
    id: 'cms.tradeitem.filter.classified',
    defaultMessage: '已审核归类',
  },
});
export default messages;
