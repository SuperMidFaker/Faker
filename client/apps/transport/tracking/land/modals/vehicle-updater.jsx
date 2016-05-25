import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Modal, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { closeVehicleModal, saveVehicle } from 'common/reducers/trackingLandStatus';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

function ModalInput(props) {
  const { type = 'text', value, onChange, field, placeholder = '' } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  return (
    <Input type={type} placeholder={placeholder}
      value={value} onChange={handleChange}
    />
  );
}
ModalInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  field: PropTypes.string,
  placeholder: PropTypes.string,
};
const FormItem = Form.Item;
@injectIntl
@connect(
  state => ({
    visible: state.trackingLandStatus.vehicleModal.visible,
    dispId: state.trackingLandStatus.vehicleModal.dispId,
  }),
  { closeVehicleModal, saveVehicle })
export default class VehicleUpdater extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    onOK: PropTypes.func,
    closeVehicleModal: PropTypes.func.isRequired,
    saveVehicle: PropTypes.func.isRequired,
  }
  state = {
    vehiclePlate: '',
    driverName: '',
    remark: '',
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleFieldChange = (field, value) => {
    this.setState({ [field]: value });
  }
  handleOk = () => {
    const { dispId, onOK } = this.props;
    const { vehiclePlate, driverName, remark } = this.state;
    this.props.saveVehicle(dispId, vehiclePlate, driverName, remark).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.closeVehicleModal();
          onOK();
        }
      });
  }
  handleCancel = () => {
    this.props.closeVehicleModal();
  }
  render() {
    const { vehiclePlate, driverName, remark } = this.state;
    const colSpan = 4;
    return (
      <Modal title={this.msg('vehicleModalTitle')} onCancel={this.handleCancel}
        onOk={this.handleOk} visible={this.props.visible}
      >
        <Form className="row">
          <FormItem label={this.msg('vehiclePlate')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <ModalInput field="vehiclePlate" value={vehiclePlate}
              onChange={this.handleFieldChange}
            />
          </FormItem>
          <FormItem label={this.msg('driverName')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <ModalInput field="driverName" value={driverName}
              onChange={this.handleFieldChange}
            />
          </FormItem>
          <FormItem label={this.msg('taskRemark')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <ModalInput type="textarea" placeholder={this.msg('remarkPlaceholder')}
              field="remark" value={remark} onChange={this.handleFieldChange}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
