import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Modal, DatePicker } from 'antd';
import moment from 'moment';
import { showChangeActDateModal, changePickDeliverDate } from 'common/reducers/trackingLandStatus';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginName: state.account.username,
    visible: state.trackingLandStatus.changeActDateModal.visible,
    dispId: state.trackingLandStatus.changeActDateModal.dispId,
    shipmtNo: state.trackingLandStatus.changeActDateModal.shipmtNo,
    status: state.shipment.previewer.dispatch.status,
    pickupActDate: state.trackingLandStatus.changeActDateModal.pickupActDate,
    deliverActDate: state.trackingLandStatus.changeActDateModal.deliverActDate,
  }),
  { showChangeActDateModal, changePickDeliverDate }
)

export default class ChangeActDateModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    pickupActDate: PropTypes.string,
    deliverActDate: PropTypes.string,
    shipmtNo: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    showChangeActDateModal: PropTypes.func.isRequired,
    changePickDeliverDate: PropTypes.func.isRequired,
    status: PropTypes.number.isRequired,
  }
  state = {
    pickupActDate: moment(this.props.pickupActDate),
    deliverActDate: moment(this.props.deliverActDate),
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      pickupActDate: moment(nextProps.pickupActDate),
      deliverActDate: moment(nextProps.deliverActDate),
    });
  }
  handleOk = () => {
    const { dispId, shipmtNo, loginName, loginId, tenantId, tenantName } = this.props;
    const { pickupActDate, deliverActDate } = this.state;
    const data = { dispId, shipmtNo, loginName, loginId, tenantId, tenantName,
      pickupActDate: moment(pickupActDate).format('YYYY-MM-DD HH:mm:ss'),
    };
    if (this.props.status === SHIPMENT_TRACK_STATUS.delivered) {
      data.deliverActDate = moment(deliverActDate).format('YYYY-MM-DD HH:mm:ss');
    }
    this.props.changePickDeliverDate(data).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleCancel();
        message.info('修改成功');
      }
    });
  }
  handlePickupActDateChange = (value) => {
    this.setState({ pickupActDate: value });
  }
  handleDeliverActDateChange = (value) => {
    this.setState({ deliverActDate: value });
  }
  handleCancel = () => {
    this.props.showChangeActDateModal({ visible: false });
  }
  render() {
    const colSpan = 10;
    return (
      <Modal title="纠正节点时间" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <FormItem label="实际提货时间" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} >
          <DatePicker value={this.state.pickupActDate} onChange={this.handlePickupActDateChange} />
        </FormItem>
        {this.props.status === SHIPMENT_TRACK_STATUS.delivered ? (
          <FormItem label="实际送货时间" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} >
            <DatePicker value={this.state.deliverActDate} onChange={this.handleDeliverActDateChange} />
          </FormItem>) : ''}
      </Modal>
    );
  }
}
