import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Modal, DatePicker } from 'antd';
import moment from 'moment';
import { showChangeDeliverPrmDateModal, changeDeliverPrmDate } from 'common/reducers/trackingLandStatus';
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginName: state.account.username,
    visible: state.trackingLandStatus.changeDeliverPrmDateModal.visible,
    dispId: state.trackingLandStatus.changeDeliverPrmDateModal.dispId,
    shipmtNo: state.trackingLandStatus.changeDeliverPrmDateModal.shipmtNo,
    deliverPrmDate: state.trackingLandStatus.changeDeliverPrmDateModal.deliverPrmDate,
  }),
  { showChangeDeliverPrmDateModal, changeDeliverPrmDate }
)

export default class ChangeDeliverPrmDateModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    deliverPrmDate: PropTypes.string,
    shipmtNo: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    showChangeDeliverPrmDateModal: PropTypes.func.isRequired,
    changeDeliverPrmDate: PropTypes.func.isRequired,
  }
  state = {
    deliverPrmDate: moment(this.props.deliverPrmDate),
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      deliverPrmDate: moment(nextProps.deliverPrmDate),
    });
  }
  handleOk = () => {
    const { dispId, shipmtNo, loginName, loginId, tenantId, tenantName } = this.props;
    const { deliverPrmDate } = this.state;
    const data = { dispId, shipmtNo, loginName, loginId, tenantId, tenantName,
      deliverPrmDate: moment(deliverPrmDate).format('YYYY-MM-DD HH:mm:ss'),
    };
    this.props.changeDeliverPrmDate(data).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleCancel();
        message.info('修改成功');
      }
    });
  }
  handleDeliverPrmDateChange = (value) => {
    this.setState({ deliverPrmDate: value });
  }
  handleCancel = () => {
    this.props.showChangeDeliverPrmDateModal({ visible: false });
  }
  render() {
    const colSpan = 10;
    return (
      <Modal title="修改承诺送货时间" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <FormItem label="承诺送货时间" labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} >
          <DatePicker value={this.state.deliverPrmDate} onChange={this.handleDeliverPrmDateChange} />
        </FormItem>
      </Modal>
    );
  }
}
