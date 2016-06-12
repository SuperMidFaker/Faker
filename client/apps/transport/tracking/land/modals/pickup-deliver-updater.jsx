import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, DatePicker, Modal, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { closeDateModal, savePickOrDeliverDate } from 'common/reducers/trackingLandStatus';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.trackingLandStatus.dateModal.visible,
    type: state.trackingLandStatus.dateModal.type,
    dispId: state.trackingLandStatus.dateModal.dispId,
    shipmtNo: state.trackingLandStatus.dateModal.shipmtNo,
  }),
  { closeDateModal, savePickOrDeliverDate })
export default class VehicleUpdater extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onOK: PropTypes.func,
    closeDateModal: PropTypes.func.isRequired,
    savePickOrDeliverDate: PropTypes.func.isRequired,
  }
  state = {
    actDate: '',
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleFieldChange = (value) => {
    this.setState({ actDate: value });
  }
  handleOk = () => {
    const { type, shipmtNo, dispId, onOK } = this.props;
    this.props.savePickOrDeliverDate(type, shipmtNo, dispId, this.state.actDate).then(
      result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.closeDateModal();
          onOK();
        }
      });
  }
  handleCancel = () => {
    this.props.closeDateModal();
  }
  render() {
    const { actDate } = this.state;
    const colSpan = 6;
    let title;
    if (this.props.type === 'pickup') {
      title = this.msg('pickupModalTitle');
    } else {
      title = this.msg('deliverModalTitle');
    }
    return (
      <Modal title={title} onCancel={this.handleCancel} onOk={this.handleOk}
      visible={this.props.visible}
      >
        <Form className="row">
          <FormItem label={this.msg('chooseActualTime')} labelCol={{span: colSpan}}
            wrapperCol={{span: 24 - colSpan}}
          >
            <DatePicker showTime value={actDate} onChange={this.handleFieldChange}
              format="yyyy-MM-dd HH:mm:ss"
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
