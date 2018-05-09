import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, Layout, message, notification } from 'antd';
import PageHeader from 'client/components/PageHeader';
import { loadFormRequires, loadOrder, editOrder, validateOrder } from 'common/reducers/sofOrders';
import { loadRequireOrderTypes } from 'common/reducers/sofOrderPref';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
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

function fetchData({ state, params, dispatch }) {
  const proms = [
    dispatch(loadFormRequires({ tenantId: state.account.tenantId })),
    dispatch(loadRequireOrderTypes()),
    dispatch(loadOrder(params.orderNo)),
    dispatch(loadCmsParams()),
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
  { editOrder, validateOrder }
)
export default class EditOrder extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.shape({ shipmt_order_no: PropTypes.string }).isRequired,
    editOrder: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = () => {
    const { formData } = this.props;
    const valitFormData = {};
    ['customer_name', 'cust_shipmt_goods_type', 'cust_shipmt_transfer', 'flow_id',
      'ext_attr_1', 'ext_attr_2', 'ext_attr_3', 'ext_attr_4', 'cust_order_no', 'id',
      'customer_partner_id'].forEach((vaKey) => {
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
        notification.info({
          message: '提示信息',
          description: VALIDATE_MSG[result.data.msgkey],
          btn: (<div>
            <a role="presentation" onClick={() => this.handleEdit(true)}>继续保存</a>
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
        notification.error({
          message: '错误信息',
          description: result.error.message,
        });
      } else {
        message.success('保存成功');
        this.handleCancel();
      }
    });
  }
  handleCancel = () => {
    this.context.router.push('/scof/shipments');
  }
  render() {
    return (
      <Layout>
        <PageHeader breadcrumb={[this.msg('shipmentOrders'), this.msg('editOrder')]}>
          <PageHeader.Actions>
            <Button icon="save" type="primary" onClick={this.handleSave} loading={this.props.saving}>
              {this.msg('save')}
            </Button>
            <Button onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <OrderForm operation="edit" />
        </Content>
      </Layout>
    );
  }
}
