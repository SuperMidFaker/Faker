import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import OrderForm from './forms/orderForm';
import { loadOrder } from 'common/reducers/crmOrders';
import { loadPartnerFlowList } from 'common/reducers/scofFlow';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ location, dispatch }) {
  return dispatch(loadOrder(location.query.shipmtOrderNo));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    formData: state.crmOrders.formData,
  }),
  { loadPartnerFlowList }
)
@connectNav({
  depth: 3,
  moduleName: 'scof',
})
export default class View extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData.customer_partner_id !== this.props.formData.customer_partner_id) {
      this.props.loadPartnerFlowList({
        partnerId: nextProps.formData.customer_partner_id,
        tenantId: nextProps.tenantId,
      });
    }
  }

  msg = key => formatMsg(this.props.intl, key)
  render() {
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('shipmentOrders')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('viewOrder')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <OrderForm operation="view" />
        </Content>
      </div>
    );
  }
}
