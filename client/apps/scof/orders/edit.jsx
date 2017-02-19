import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, message, Layout } from 'antd';
import OrderForm from './form';
import { loadOrder, editOrder } from 'common/reducers/crmOrders';
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
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.crmOrders.formData,
  }),
  { editOrder }
)
export default class Edit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    editOrder: PropTypes.func.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = () => {
    const { formData, tenantId, loginId, username, tenantName } = this.props;
    if (formData.customer_name === '') {
      message.error('请选择客户');
    } else if (formData.cust_shipmt_trans_mode === '') {
      message.error('请选择运输方式');
    } else if (formData.cust_shipmt_goods_type === null) {
      message.error('请选择货物类型');
    } else {
      this.props.editOrder({ formData, tenantId, loginId, username, tenantName }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('保存成功');
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
        <Header className="top-bar">
          <span>修改订单</span>
          <div className="top-bar-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content">
          <div className="page-body card-wrapper">
            <OrderForm operation="edit" />
          </div>
        </Content>
      </div>
    );
  }
}
