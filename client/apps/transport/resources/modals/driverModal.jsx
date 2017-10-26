import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal } from 'antd';
import { connect } from 'react-redux';
import { addDriver, editDriver, toggleDriverModal } from 'common/reducers/transportResources';
import withPrivilege from 'client/common/decorators/withPrivilege';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.transportResources.driverModal.visible,
  driver: state.transportResources.driverModal.driver,
  operation: state.transportResources.driverModal.operation,
}), { addDriver, editDriver, toggleDriverModal })
@withPrivilege({
  module: 'transport',
  feature: 'resources',
  action: props => props.operation === 'edit' ? 'edit' : 'create',
})
@Form.create()
export default class DriverModal extends Component {
  static propTypes = {
    operation: PropTypes.string.isRequired,              // operation='add'表示添加司机,operation='edit'表示编辑司机信息
    form: PropTypes.object.isRequired,              // DriverFormContainer中props.form对象
    driver: PropTypes.object,                       // 只有在mode='edit'下才需要
    addDriver: PropTypes.func.isRequired,  // 增加车辆的actionCreator
    editDriver: PropTypes.func.isRequired, // 修改车辆信息的actionCreator
    tenantId: PropTypes.number.isRequired,
    toggleDriverModal: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  handleDriverAdd = () => {
    const { form, tenantId } = this.props;
    const newDriverInfo = form.getFieldsValue();
    this.props.addDriver({ ...newDriverInfo, tenant_id: tenantId }).then(() => {
      this.handleCancel();
    });
  }
  handleDriverEdit = () => {
    const { form, driver } = this.props;
    const editDriverInfo = form.getFieldsValue();
    const editDriverId = parseInt(driver.driver_id, 10);
    this.props.editDriver({ driverId: editDriverId, driverInfo: editDriverInfo }).then(() => {
      this.handleCancel();
    });
  }
  handleOk = () => {
    const { operation } = this.props;
    if (operation === 'edit') {
      this.handleDriverEdit();
    } else if (operation === 'add') {
      this.handleDriverAdd();
    }
  }
  handleCancel = () => {
    this.props.toggleDriverModal(false);
    this.props.form.resetFields();
  }
  render() {
    const { form, visible, driver } = this.props;
    const getFieldDecorator = form.getFieldDecorator;

    return (
      <Modal maskClosable={false} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel}>
        <Form layout="horizontal">
          <FormItem {...formItemLayout} label="姓名" required>
            {getFieldDecorator('name', {
              initialValue: driver.name,
            })(<Input required />)}
          </FormItem>
          <FormItem {...formItemLayout} label="手机号码" required>
            {getFieldDecorator('phone', {
              initialValue: driver.phone,
            })(<Input required />)}
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            {getFieldDecorator('remark', {
              initialValue: driver.remark,
            })(<Input.TextArea />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
