import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, DatePicker, Modal, message, Alert } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeDateModal, saveBatchPickOrDeliverDate, reportLoc } from 'common/reducers/trackingLandStatus';
import { TRACKING_POINT_FROM_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    visible: state.trackingLandStatus.dateModal.visible,
    type: state.trackingLandStatus.dateModal.type,
    shipments: state.trackingLandStatus.dateModal.shipments,
  }),
  { closeDateModal, saveBatchPickOrDeliverDate, reportLoc }
)
@Form.create()
export default class PickupDeliverUpdater extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    shipments: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    onOK: PropTypes.func,
    closeDateModal: PropTypes.func.isRequired,
    saveBatchPickOrDeliverDate: PropTypes.func.isRequired,
    reportLoc: PropTypes.func.isRequired,
  }
  state = {
    warningMessage: '',
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { form, type, shipments, onOK, loginId, loginName, tenantId, tenantName } = this.props;
        const { actDate } = form.getFieldsValue();
        this.props.saveBatchPickOrDeliverDate({ type, shipments: JSON.stringify(shipments), actDate, loginId, tenantId, loginName, tenantName }).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message, 10);
            } else {
              for (let i = 0; i < shipments.length; i++) {
                const { dispId, shipmtNo, parentNo, location } = shipments[i];
                // 上报位置
                location.location_time = actDate;
                location.from = TRACKING_POINT_FROM_TYPE.manual;
                this.props.reportLoc(tenantId, shipmtNo, parentNo, dispId, location);
              }
              this.props.closeDateModal();
              form.resetFields();
              onOK();
            }
          });
      }
    });
  }
  handleCancel = () => {
    this.props.closeDateModal();
    this.props.form.resetFields();
  }
  handleDateChange = (date) => {
    const shipment = this.props.shipments.find((item) => {
      const daysDiff = date.diff(new Date(item.estDate), 'days');
      if (daysDiff <= -3 || daysDiff >= 3) {
        return true;
      }
      return false;
    });

    if (shipment) {
      this.setState({ warningMessage: `所选时间和 ${shipment.shipmtNo} 预计时间${moment(shipment.estDate).format('YYYY.MM.DD')}相差较大， 请注意是否选错日期！` });
    } else {
      this.setState({ warningMessage: '' });
    }
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { warningMessage } = this.state;
    const colSpan = 6;
    let title;
    let ruleMsg;
    if (this.props.type === 'pickup') {
      title = this.msg('pickupModalTitle');
      ruleMsg = this.msg('pickupTimeMust');
    } else {
      title = this.msg('deliverModalTitle');
      ruleMsg = this.msg('deliverTimeMust');
    }

    return (
      <Modal maskClosable={false} title={title} onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        <Alert message={warningMessage} type="warning" showIcon style={{ display: warningMessage === '' ? 'none' : '' }} />
        <Form className="row">
          <FormItem label={this.msg('chooseActualTime')} labelCol={{ span: colSpan }}
            wrapperCol={{ span: 24 - colSpan }} required
          >
            {getFieldDecorator('actDate', {
              rules: [{
                type: 'object', required: true, message: ruleMsg,
              }],
            })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.handleDateChange} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
