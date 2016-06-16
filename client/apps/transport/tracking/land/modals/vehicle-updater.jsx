import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Col, Checkbox, Modal, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { closeVehicleModal, saveVehicle } from 'common/reducers/trackingLandStatus';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

function ModalInput(props) {
  const { type = 'text', value, disabled, onChange, field, placeholder = '' } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  return (
    <Input type={type} placeholder={placeholder} disabled={disabled}
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
    plateDisabled: false,
    driverName: '',
    driverDisabled: false,
    remark: '',
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleFieldChange = (field, value) => {
    this.setState({ [field]: value });
  }
  handlePlateCheck = (ev) => {
    const checked = ev.target.checked;
    this.setState({
      plateDisabled: checked,
    });
  }
  handleDriverCheck = (ev) => {
    const checked = ev.target.checked;
    this.setState({
      driverDisabled: checked,
    });
  }
  handleOk = () => {
    const { dispId, onOK } = this.props;
    const { vehiclePlate, plateDisabled, driverName, driverDisabled, remark } = this.state;
    const plate = plateDisabled ? this.msg('unknownPlate') : vehiclePlate;
    const driver = driverDisabled ? this.msg('unknownDriver') : driverName;
    this.props.saveVehicle(dispId, plate, driver, remark).then(
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
    const { vehiclePlate, plateDisabled, driverName, driverDisabled, remark } = this.state;
    const colSpan = 4;
    return (
      <Modal title={this.msg('vehicleModalTitle')} onCancel={this.handleCancel}
        onOk={this.handleOk} visible={this.props.visible}
      >
        <Form className="row">
          <FormItem label={this.msg('vehiclePlate')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <Col span="17">
              <ModalInput field="vehiclePlate" value={vehiclePlate}
                onChange={this.handleFieldChange} disabled={plateDisabled}
              />
            </Col>
            <Col offset="1" span="6">
              <Checkbox checked={plateDisabled} onChange={this.handlePlateCheck}>
              {this.msg('unknownPlate')}
              </Checkbox>
            </Col>
          </FormItem>
          <FormItem label={this.msg('driverName')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <Col span="17">
              <ModalInput field="driverName" value={driverName}
                onChange={this.handleFieldChange} disabled={driverDisabled}
              />
            </Col>
            <Col offset="1" span="6">
              <Checkbox checked={driverDisabled} onChange={this.handleDriverCheck}>
              {this.msg('unknownDriver')}
              </Checkbox>
            </Col>
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
