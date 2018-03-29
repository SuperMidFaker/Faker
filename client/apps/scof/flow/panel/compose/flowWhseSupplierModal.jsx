import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form } from 'antd';
import { addSupplier } from 'common/reducers/cwmWarehouse';
import { showCwmSupplierModal } from 'common/reducers/scofFlow';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.scofFlow.cwmSupplierModal.visible,
    whseCode: state.scofFlow.cwmSupplierModal.whseCode,
    ownerPid: state.scofFlow.cwmSupplierModal.ownerPid,
  }),
  {
    showCwmSupplierModal, addSupplier,
  }
)
@Form.create()
export default class FlowWhseSuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    ownerPid: PropTypes.number,
    onSupplierAdd: PropTypes.func,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.showCwmSupplierModal({
      visible: false,
      whseCode: null,
      ownerPid: null,
    });
  }
  handleAdd = () => {
    const { whseCode, ownerPid, onSupplierAdd } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const supplier = { ...values, owner_partner_id: ownerPid };
        this.props.addSupplier(supplier, whseCode).then((result) => {
          if (!result.error) {
            if (onSupplierAdd) {
              onSupplierAdd(supplier);
            }
            this.handleCancel();
          }
        });
      }
    });
  }
  render() {
    const {
      form: { getFieldDecorator }, visible,
    } = this.props;
    if (!visible) {
      return null;
    }
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    }; return (
      <Modal
        maskClosable={false}
        destroyOnClose
        title="添加供货商"
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleAdd}
      >
        <Form layout="horizontal">
          <FormItem label="名称" {...formItemLayout}>
            {getFieldDecorator('name', { rules: [{ required: true }] })(<Input />)}
          </FormItem>
          <FormItem label="代码" required {...formItemLayout}>
            {getFieldDecorator('code', { rules: [{ required: true }] })(<Input />)}
          </FormItem>
          <FormItem label="海关编码" {...formItemLayout}>
            {getFieldDecorator('customs_code')(<Input />)}
          </FormItem>
          <FormItem label="供货商仓库海关编码" {...formItemLayout}>
            {getFieldDecorator('ftz_whse_code')(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

