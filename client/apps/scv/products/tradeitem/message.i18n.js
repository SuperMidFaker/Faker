import { defineMessages } from 'react-intl';

const messages = defineMessages({
  productsTradeItem: {
    id: 'scv.products.tradeitem',
    defaultMessage: '贸易商品归类',
  },
  filterUnclassified: {
    id: 'scv.products.tradeitem.filter.unclassified',
    defaultMessage: '未归类',
  },
  filterPending: {
    id: 'scv.products.tradeitem.filter.pending',
    defaultMessage: '未审核',
  },
  filterClassified: {
    id: 'scv.products.tradeitem.filter.classified',
    defaultMessage: '已审核归类',
  },
});
export default messages;
