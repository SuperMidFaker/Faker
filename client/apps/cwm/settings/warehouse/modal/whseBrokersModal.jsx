import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form } from 'antd';
import { toggleBrokerModal, addBroker, loadBrokers, updateBroker } from 'common/reducers/cwmWarehouse';
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
  }),
  { toggleBrokerModal, addBroker, loadBrokers, updateBroker }
)

@Form.create()
export default class SuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && nextProps.broker.id) {
      this.props.form.setFieldsValue(nextProps.broker);
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleBrokerModal(false);
    this.props.form.resetFields();
  }
  handleAdd = () => {
    const { tenantId, whseCode, loginId, broker } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (broker.id) {
          this.props.updateBroker(values, broker.id, loginId).then(() => {
            this.props.loadBrokers(whseCode, tenantId);
            this.props.toggleBrokerModal(false);
          });
        } else {
          this.props.addBroker(values, tenantId, whseCode, loginId).then((result) => {
            if (!result.error) {
              this.props.loadBrokers(whseCode, tenantId);
              this.props.toggleBrokerModal(false);
            }
          });
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