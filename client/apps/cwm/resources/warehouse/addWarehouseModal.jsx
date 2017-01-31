import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Modal, Form, Input, Radio, message } from 'antd';
import { closeAddWarehouseModal, addWarehouse } from 'common/reducers/cwmResources';
import { formatMsg } from './message.i18n';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(state => ({
  visible: state.cwmResources.addWarehouseModal.visible,
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
            message.error(result.error.message);
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
    const { form: { getFieldDecorator }, visible } = this.props;
    return (
      <Modal title={this.msg('addWarehouse')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form horizontal>
          <FormItem label={this.msg('warehouseName')} {...this.formColSpans}>
            {
              getFieldDecorator('warehouse_name')(<Input />)
            }
          </FormItem>
          <FormItem label={this.msg('warehouseCode')} {...this.formColSpans}>
            {
              getFieldDecorator('warehouse_code')(<Input />)
            }
          </FormItem>
          <FormItem label={this.msg('isBonded')} {...this.formColSpans}>
            {
              getFieldDecorator('is_bonded', {
                rules: [{
                  required: true, message: this.msg('transModeRequired'),
                }],
              })(
                <RadioGroup>
                  <RadioButton value="BONDED">{this.msg('bonded')}</RadioButton>
                  <RadioButton value="NONBONDED">{this.msg('nonBonded')}</RadioButton>
                </RadioGroup>
              )
            }
          </FormItem>
          <FormItem label={this.msg('location')} {...this.formColSpans}>
            {
              getFieldDecorator('location')(<Input />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
