import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import OrderForm from './form';
import { loadOrder } from 'common/reducers/crmOrders';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

function fetchData({ location, dispatch }) {
  return dispatch(loadOrder(location.query.shipmtOrderNo));
}

@connectFetch()(fetchData)
@injectIntl

@connectNav({
  depth: 3,
  moduleName: 'customer',
})
export default class View extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)

  render() {
    return (
      <div>
        <header className="top-bar">
          <span>查看订单</span>
        </header>
        <div className="main-content">
          <div className="page-body card-wrapper">
            <OrderForm operation="view" />
          </div>
        </div>
      </div>
    );
  }
}
