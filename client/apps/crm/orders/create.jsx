import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Button, message } from 'antd';
import OrderForm from './form';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import { submitOrder } from 'common/reducers/crmOrders';
const formatMsg = format(messages);

@injectIntl

@connectNav({
  depth: 3,
  text: '新建订单',
  moduleName: 'customer',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    formData: state.crmOrders.formData,
  }),
  { submitOrder }
)
export default class Create extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    tenantName: PropTypes.string.isRequired,
    formData: PropTypes.object.isRequired,
    submitOrder: PropTypes.func.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = () => {
    const { formData, tenantId, loginId, username, tenantName } = this.props;


    // cust_shipmt_package: '',
    // ccb_need_exchange: 0,
    if (formData.customer_name === '') {
      message.error('请选择客户');
    } else if (formData.cust_shipmt_trans_mode === '') {
      message.error('请选择运输方式');
    } else if (formData.cust_shipmt_goods_type === null) {
      message.error('请选择货物类型');
    } else if (formData.transports[0].trs_mode_code === '') {
      message.error('请选择运输模式');
    } else {
      this.props.submitOrder({ formData, tenantId, loginId, username, tenantName }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('保存成功');
        }
      });
    }
  }
  render() {
    return (
      <div>
        <header className="top-bar">
          <span>新建订单</span>
        </header>
        <div className="top-bar-tools">
          <Button size="large" type="primary" onClick={this.handleSave}>
            {this.msg('save')}
          </Button>
        </div>
        <div className="main-content">
          <div className="page-body card-wrapper">
            <OrderForm operation="create" />
          </div>
        </div>
      </div>
    );
  }
}
