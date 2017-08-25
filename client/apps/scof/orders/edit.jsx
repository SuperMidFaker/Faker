import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, message, Layout } from 'antd';
import OrderForm from './forms/orderForm';
import { loadFormRequires, loadOrder, editOrder } from 'common/reducers/crmOrders';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ state, location, dispatch }) {
  const proms = [
    dispatch(loadFormRequires({ tenantId: state.account.tenantId })),
    dispatch(loadOrder(location.query.shipmtOrderNo)),
  ];
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 3,
  moduleName: 'scof',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.crmOrders.formData,
    saving: state.crmOrders.orderSaving,
  }),
  { editOrder }
)
export default class EditOrder extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    editOrder: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = () => {
    const { formData, tenantId, loginId, username, tenantName } = this.props;
    if (formData.customer_name === '') {
      message.error('请选择客户');
    } else if (formData.cust_shipmt_goods_type === null) {
      message.error('请选择货物类型');
    } else if (!formData.flow_id) {
      message.error('请选择流程');
    } else {
      this.props.editOrder({ formData, tenantId, loginId, username, tenantName }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.info('保存成功');
          this.context.router.push('/scof/orders');
        }
      });
    }
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  render() {
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('shipmentOrders')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('editOrder')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" onClick={this.handleSave} loading={this.props.saving}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <OrderForm operation="edit" />
        </Content>
      </div>
    );
  }
}
