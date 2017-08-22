import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, message, Input, Form } from 'antd';
import { hideCarrierModal, addRelatedEnterPrises, loadCarriers } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    visible: state.cwmWarehouse.carrierModal.visible,
  }),
  { hideCarrierModal, addRelatedEnterPrises, loadCarriers }
)

@Form.create()
export default class SuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.hideCarrierModal();
  }
  handleAdd = () => {
    const { tenantId, whseCode, loginId } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.ent_cus_code.length !== 10) {
          message.info('请输入10位海关编码');
          return;
        }
        this.props.addRelatedEnterPrises(whseCode, tenantId, values, 'carrier', loginId).then((result) => {
          if (!result.error) {
            this.props.loadCarriers(whseCode, tenantId);
            this.props.hideCarrierModal();
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    }; return (
      <Modal title="添加承运人" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        <Form layout="horizontal">
          <FormItem label="承运人代码" {...formItemLayout}>
            {getFieldDecorator('ent_code', {
              rules: [{ required: true, message: 'Please input ent_code!' }],
            })(<Input />)}
          </FormItem>
          <FormItem label="承运人名称" {...formItemLayout}>
            {getFieldDecorator('ent_name', {
              rules: [{ required: true, message: 'Please input ent_code!' }],
            })(<Input />)}
          </FormItem>
          <FormItem label="海关编码" {...formItemLayout}>
            {getFieldDecorator('ent_cus_code', {
              rules: [{ required: true, message: 'Please input ent_cus_code!' }],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
