import React, { Component } from 'react';
import { Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import OrderForm from './form';
import { loadOrder } from 'common/reducers/crmOrders';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ location, dispatch }) {
  return dispatch(loadOrder(location.query.shipmtOrderNo));
}

@connectFetch()(fetchData)
@injectIntl

@connectNav({
  depth: 3,
  moduleName: 'scof',
})
export default class View extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)

  render() {
    return (
      <div>
        <Header className="top-bar">
          <span>查看订单</span>
        </Header>
        <Content className="main-content">
          <div className="page-body card-wrapper">
            <OrderForm operation="view" />
          </div>
        </Content>
      </div>
    );
  }
}