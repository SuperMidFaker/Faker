import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { loadFormRequires, submitOrder, validateOrder } from 'common/reducers/sofOrders';
import { loadRequireOrderTypes } from 'common/reducers/sofOrderPref';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Button, Layout, notification } from 'antd';
import { format } from 'client/common/i18n/helpers';
import PageHeader from 'client/components/PageHeader';
import OrderForm from './order';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const VALIDATE_MSG = {
  no_customer: '请选择客户',
  no_goods_type: '请选择货物类型',
  no_order_type: '请选择订单类型',
  no_order_type_attr: '请填写订单类型扩展属性',
  no_flowid: '请选择流程',
  cust_order_no_exist: '客户订单号已存在',
};


function fetchData({ state, dispatch }) {
  const proms = [
    dispatch(loadFormRequires({
      tenantId: state.account.tenantId,
    })),
    dispatch(loadRequireOrderTypes()),
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
    formData: state.sofOrders.formData,
    saving: state.sofOrders.orderSaving,
  }),
  { submitOrder, validateOrder }
)
export default class CreateOrder extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.shape({
      cust_shipmt_transfer: PropTypes.string,
    }).isRequired,
    submitOrder: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = () => {
    const { formData } = this.props;
    const valitFormData = {};
    ['customer_name', 'cust_shipmt_goods_type', 'cust_shipmt_transfer', 'flow_id',
      'ext_attr_1', 'ext_attr_2', 'ext_attr_3', 'ext_attr_4', 'cust_order_no'].forEach((vaKey) => {
      valitFormData[vaKey] = formData[vaKey];
    });
    this.props.validateOrder(valitFormData).then((result) => {
      if (result.error) {
        notification.error({
          message: '错误信息',
          description: result.error.message,
          duration: 15,
        });
      } else if (result.data.level === 'error') {
        notification.error({
          message: '错误信息',
          description: VALIDATE_MSG[result.data.msgkey],
          duration: 15,
        });
      } else if (result.data.level === 'warn') {
        notification.warn({
          message: '警告信息',
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
    formData.orderDetails = formData.orderDetails.filter(ord => ord.invoice_detail_id);
    this.props.submitOrder({ formData, tenantName }).then((result) => {
      if (result.error) {
        notification.error({
          message: '错误信息',
          description: result.error.message,
        });
      } else {
        notification.success({
          message: '保存成功',
          description: '订单已经创建,是否继续编辑发票货物明细',
          btn: (<div>
            <a
              role="presentation"
              onClick={() => {
                notification.close('continue-edit');
                this.context.router.push(`/scof/orders/edit/${result.data.shipmt_order_no}`);
            }}
            >继续编辑</a>
            <span className="ant-divider" />
            <a
              role="presentation"
              onClick={() => {
                notification.close('continue-edit');
              this.context.router.push('/scof/orders');
            }}
            >直接返回</a>
          </div>),
          key: 'continue-edit',
          duration: 0,
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.push('/scof/orders');
  }
  render() {
    const { formData } = this.props;
    const invalidOrder = !formData.cust_shipmt_transfer || !formData.flow_id;
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
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" onClick={this.handleSave} loading={this.props.saving} disabled={invalidOrder}>
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
