import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { notification, Breadcrumb, Button, Layout } from 'antd';
import OrderForm from './forms/orderForm';
import PageHeader from 'client/components/PageHeader';
import { loadFormRequires, submitOrder, validateOrder } from 'common/reducers/crmOrders';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Content } = Layout;
const VALIDATE_MSG = {
  no_customer: '请选择客户',
  no_goods_type: '请选择货物类型',
  no_flowid: '请选择流程',
  cust_order_no_exist: '客户订单号已存在',
};


function fetchData({ state, dispatch }) {
  return dispatch(loadFormRequires({
    tenantId: state.account.tenantId,
  }));
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
  { submitOrder, validateOrder }
)
export default class CreateOrder extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    submitOrder: PropTypes.func.isRequired,
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
            <a role="presentation" onClick={() => this.handleSubmit(true)}>继续创建</a>
            <span className="ant-divider" />
            <a role="presentation" onClick={() => notification.close('confirm-submit')}>取消</a>
          </div>),
          key: 'confirm-submit',
          duration: 0,
        });
      } else {
        this.handleSubmit();
      }
    });
  }
  handleSubmit = (close) => {
    if (close) {
      notification.close('confirm-submit');
    }
    const { formData, tenantName } = this.props;
    this.props.submitOrder({ formData, tenantName }).then((result) => {
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
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('shipmentOrders')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('createOrder')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" onClick={this.handleSave} loading={this.props.saving}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <OrderForm operation="create" />
        </Content>
      </Layout>
    );
  }
}
