import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Modal, Form, Input, Radio, message } from 'antd';
import { closeAddWarehouseModal, addWarehouse } from 'common/reducers/scvWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(state => ({
  visible: state.scvWarehouse.addWarehouseModal.visible,
  tenantId: state.account.tenantId,
}),
  { closeAddWarehouseModal, addWarehouse }
)
@Form.create()
export default class AddWarehouseModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    closeAddWarehouseModal: PropTypes.func.isRequired,
    addWarehouse: PropTypes.func.isRequired,
  }
  msg = formatMsg(this.props.intl)
  formColSpans = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const formData = this.props.form.getFieldsValue();
        formData.tenant_id = this.props.tenantId;
        this.props.addWarehouse(formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.props.form.resetFields();
            this.props.closeAddWarehouseModal();
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.closeAddWarehouseModal();
  }
  render() {
    const { form: { getFieldDecorator, getFieldValue }, visible } = this.props;
    return (
      <Modal title={this.msg('addWarehouse')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form layout="horizontal">
          <FormItem label={this.msg('orderNo')} {...this.formColSpans}>
            {
              getFieldDecorator('order_no')(<Input />)
            }
          </FormItem>
          <FormItem label={this.msg('mode')} {...this.formColSpans}>
            {
              getFieldDecorator('trans_mode', {
                rules: [{
                  required: true, message: this.msg('transModeRequired'),
                }],
              })(
                <RadioGroup>
                  <RadioButton value="SEA">{this.msg('seaWay')}</RadioButton>
                  <RadioButton value="AIR">{this.msg('airWay')}</RadioButton>
                </RadioGroup>
              )
            }
          </FormItem>
          {
            getFieldValue('trans_mode') === 'SEA' &&
            <FormItem label={this.msg('vessel')} {...this.formColSpans}>
              {
                getFieldDecorator('vessel')(<Input />)
              }
            </FormItem>
          }
          {
            getFieldValue('trans_mode') === 'SEA' &&
            <FormItem label={this.msg('billlading')} {...this.formColSpans}>
              {
                getFieldDecorator('billlading')(<Input />)
              }
            </FormItem>
          }
          {
            getFieldValue('trans_mode') === 'SEA' &&
            <FormItem label={this.msg('voyage')} {...this.formColSpans}>
              {
                getFieldDecorator('voyage')(<Input />)
              }
            </FormItem>
          }
          {
            getFieldValue('trans_mode') === 'AIR' &&
            <FormItem label={this.msg('mawb')} {...this.formColSpans}>
              {
                getFieldDecorator('mawb', {
                  rules: [{
                    required: true, message: this.msg('paramRequired'),
                  }],
                })(<Input />)
              }
            </FormItem>
          }
          {
            getFieldValue('trans_mode') === 'AIR' &&
            <FormItem label={this.msg('hawb')} {...this.formColSpans}>
              {
                getFieldDecorator('hawb')(<Input />)
              }
            </FormItem>
          }
        </Form>
      </Modal>
    );
  }
}
