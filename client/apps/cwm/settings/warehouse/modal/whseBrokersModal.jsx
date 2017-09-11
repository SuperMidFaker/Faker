import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form, Alert } from 'antd';
import { toggleBrokerModal, addBroker, loadBrokers, updateBroker, loadCCBs } from 'common/reducers/cwmWarehouse';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, PARTNER_BUSINESSES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    whseOwners: state.cwmWarehouse.whseOwners,
    visible: state.cwmWarehouse.brokerModal.visible,
    broker: state.cwmWarehouse.brokerModal.broker,
    CCBs: state.cwmWarehouse.CCBs,
  }),
  { toggleBrokerModal, addBroker, loadBrokers, updateBroker, loadCCBs }
)

@Form.create()
export default class SuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
  }
  state = {
    visible: false,
  }
  componentWillMount() {
    this.props.loadCCBs(this.props.tenantId, PARTNER_ROLES.SUP, PARTNER_BUSINESSE_TYPES.clearance, PARTNER_BUSINESSES.CCB);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && nextProps.broker.id) {
      this.props.form.setFieldsValue(nextProps.broker);
    }
  }
  componentWillUnmount() {
    this.setState({
      visible: false,
    });
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleBrokerModal(false);
    this.props.form.resetFields();
  }
  handleAdd = () => {
    const { tenantId, whseCode, loginId, broker, CCBs } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (broker.id) {
          this.props.updateBroker(values, broker.id, loginId).then(() => {
            this.props.loadBrokers(whseCode, tenantId);
            this.props.toggleBrokerModal(false);
          });
        } else {
          const CCB = CCBs.find(ccb => ccb.partner_unique_code === values.uscc_code);
          if (CCB) {
            this.props.addBroker(values, tenantId, whseCode, loginId).then((result) => {
              if (!result.error) {
                this.props.loadBrokers(whseCode, tenantId);
                this.props.toggleBrokerModal(false);
              }
            });
          } else {
            this.setState({
              visible: true,
            });
          }
        }
      }
    });
    this.props.form.resetFields();
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    }; return (
      <Modal title="添加报关代理" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        { this.state.visible && <Alert message="报关行不存在" showIcon type="error" /> }
        <Form layout="horizontal">
          <FormItem label="名称:" required {...formItemLayout}>
            {getFieldDecorator('name')(<Input required />)}
          </FormItem>
          <FormItem label="统一社会信用代码:" required {...formItemLayout}>
            {getFieldDecorator('uscc_code')(<Input />)}
          </FormItem>
          <FormItem label="海关编码:" required {...formItemLayout}>
            {getFieldDecorator('customs_code')(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
