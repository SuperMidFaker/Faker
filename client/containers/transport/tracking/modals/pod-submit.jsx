import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Radio, Upload, Button, Modal, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { closePodModal, saveSubmitPod } from 'universal/redux/reducers/transport-tracking';
import { format } from 'universal/i18n/helpers';
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
const RadioGroup = Radio.Group;
@injectIntl
@connect(
  state => ({
    visible: state.transportTracking.transit.podModal.visible,
    dispId: state.transportTracking.transit.podModal.dispId,
  }),
  { closePodModal, saveSubmitPod })
export default class VehicleUpdater extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    onOK: PropTypes.func,
    closePodModal: PropTypes.func.isRequired,
    saveSubmitPod: PropTypes.func.isRequired,
  }
  state = {
    signStatus: '',
    remark: '',
    uploadPhoto: '',
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleFieldChange = (ev) => {
    this.setState({ remark: ev.target.value });
  }
  handleSignRadioChange = (value) => {
    this.setState({ signStatus: value });
  }
  handleOk = () => {
    const { dispId, onOK } = this.props;
    const { vehiclePlate, driverName, remark } = this.state;
    this.props.saveSubmitPod(dispId, vehiclePlate, driverName, remark).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          onOK();
        }
      });
  }
  handleCancel = () => {
    this.props.closePodModal();
  }
  render() {
    const { signStatus, remark } = this.state;
    const colSpan = 4;
    return (
      <Modal title={this.msg('podModalTitle')} onCancel={this.handleCancel}
        onOk={this.handleOk} visible={this.props.visible}
      >
        <Form className="row">
          <FormItem label={this.msg('signStatus')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <RadioGroup onChange={this.handleSignRadioChange} value={signStatus}>
              <Radio key="normal" value={1}>{this.msg('normalSign')}</Radio>
              <Radio key="abnormal" value={2}>{this.msg('abnormalSign')}</Radio>
              <Radio key="refused" value={3}>{this.msg('refusedSign')}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={this.msg('signRemark')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <Input type="textarea" placeholder={this.msg('signRemarkPlaceholder')}
              row="4" value={remark} onChange={this.handleFieldChange}
            />
          </FormItem>
          <FormItem label={this.msg('podPhoto')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <Upload>
              <Button icon="upload" type="ghost" />
              { this.msg('clickSubmit') }
            </Upload>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
