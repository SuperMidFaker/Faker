import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { notification, Breadcrumb, Button, Layout } from 'antd';
import OrderForm from './forms/orderForm';
import { loadFormRequires, loadOrder, editOrder, validateOrder } from 'common/reducers/crmOrders';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

const VALIDATE_MSG = {
  no_customer: '请选择客户',
  no_goods_type: '请选择货物类型',
  no_flowid: '请选择流程',
  cust_order_no_exist: '客户订单号已存在',
};

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
    tenantName: state.account.tenantName,
    formData: state.crmOrders.formData,
    saving: state.crmOrders.orderSaving,
  }),
  { editOrder, validateOrder }
)
export default class EditOrder extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    editOrder: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = () => {
    const { formData } = this.props;
    this.props.validateOrder(formData).then((result) => {
      if (result.error) {
        notification.error({
          description: result.error.message,
          duration: 15,
        });
      } else if (result.data.level === 'error') {
        notification.error({
          description: VALIDATE_MSG[result.data.msgkey],
          duration: 15,
        });
      } else if (result.data.level === 'warn') {
        notification.warn({
          description: VALIDATE_MSG[result.data.msgkey],
          btn: (<div>
            <a role="presentation" onClick={() => this.handleEdit(true)}>继续创建</a>
            <span className="ant-divider" />
            <a role="presentation" onClick={() => notification.close('confirm-submit')}>取消</a>
          </div>),
          key: 'confirm-submit',
          duration: 0,
        });
      } else {
        this.handleEdit();
      }
    });
  }
  handleEdit = (close) => {
    if (close) {
      notification.close('confirm-submit');
    }
    const { formData, tenantName } = this.props;
    this.props.editOrder({ formData, tenantName }).then((result) => {
      if (result.error) {
        notification.error({ description: result.error.message });
      } else {
        notification.info({ description: '保存成功' });
        this.context.router.push('/scof/orders');
      }
    });
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
            <Button type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" onClick={this.handleSave} loading={this.props.saving}>
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
