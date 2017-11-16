import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, DatePicker, message, Popover, Button, Alert } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { savePickOrDeliverDate, reportLoc, cancelPickup, cancelDeliver } from 'common/reducers/trackingLandStatus';
import { TRACKING_POINT_FROM_TYPE, SHIPMENT_TRACK_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantName: state.account.tenantName,
  }),
  { savePickOrDeliverDate, reportLoc, cancelPickup, cancelDeliver }
)
@Form.create()
export default class PickupDeliverPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    parentNo: PropTypes.string,
    estDate: PropTypes.string.isRequired,
    actDate: PropTypes.string,
    type: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    onOK: PropTypes.func,
    savePickOrDeliverDate: PropTypes.func.isRequired,
    reportLoc: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    cancelPickup: PropTypes.func.isRequired,
    cancelDeliver: PropTypes.func.isRequired,
    status: PropTypes.number.isRequired,
  }
  state = {
    visible: false,
    warningMessage: '',
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { form, type, shipmtNo, parentNo, dispId, onOK, loginId, loginName, tenantId, tenantName, location } = this.props;
        const { actDate } = form.getFieldsValue();
        this.props.savePickOrDeliverDate({ type, shipmtNo, dispId, actDate, loginId, tenantId, loginName, tenantName }).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message, 10);
            } else {
              // 上报位置
              location.location_time = actDate;
              location.from = TRACKING_POINT_FROM_TYPE.manual;
              this.props.reportLoc(tenantId, shipmtNo, parentNo, dispId, location);
              form.resetFields();
              this.setState({ visible: false });
              onOK();
            }
          });
      }
    });
  }
  handleClose = () => {
    this.setState({ visible: false });
  }
  handleCancel = () => {
    const { shipmtNo, dispId, onOK, loginId, loginName, tenantId, tenantName } = this.props;
    const body = {
      shipmtNo,
      tenantId,
      tenantName,
      loginId,
      loginName,
      dispId,
    };
    if (this.props.type === 'pickup') {
      this.props.cancelPickup(body).then(() => {
        onOK();
      });
    } else if (this.props.type === 'deliver') {
      this.props.cancelDeliver(body).then(() => {
        onOK();
      });
    }
    this.setState({ visible: false });
  }
  handleShowPopover = (visible) => {
    if (visible) {
      this.setState({ visible }, () => {
        if (this.props.actDate) {
          this.props.form.setFieldsValue({ actDate: moment(this.props.actDate) });
        } else {
          this.props.form.setFieldsValue({ actDate: null });
        }
      });
    }
  }
  handleDateChange = (date) => {
    if (date) {
      const daysDiff = date.diff(new Date(this.props.estDate), 'days');
      if (daysDiff <= -3 || daysDiff >= 3) {
        this.setState({ warningMessage: `所选时间和预计时间${moment(this.props.estDate).format('YYYY.MM.DD')}相差较大， 请注意是否选错日期！` });
      } else {
        this.setState({ warningMessage: '' });
      }
    } else {
      this.setState({ warningMessage: '' });
    }
  }
  render() {
    const { shipmtNo, form: { getFieldDecorator }, status } = this.props;
    const { warningMessage } = this.state;
    let title;
    let ruleMsg;
    let label;
    let typeText = '';
    let okButtonDisabled = false;
    let cancelButtonDisabled = false;
    if (this.props.type === 'pickup') {
      title = this.msg('pickupModalTitle');
      ruleMsg = this.msg('pickupTimeMust');
      label = this.msg('pickupActDate');
      typeText = '提货';
      if (status === SHIPMENT_TRACK_STATUS.intransit) {
        okButtonDisabled = true;
      } else if (status === SHIPMENT_TRACK_STATUS.dispatched) {
        cancelButtonDisabled = true;
      }
    } else {
      title = this.msg('deliverModalTitle');
      ruleMsg = this.msg('deliverTimeMust');
      label = this.msg('deliverActDate');
      typeText = '送货';
      if (status === SHIPMENT_TRACK_STATUS.delivered) {
        okButtonDisabled = true;
      } else if (status === SHIPMENT_TRACK_STATUS.intransit) {
        cancelButtonDisabled = true;
      }
    }
    const content = (
      <Form layout="vertical">
        <Alert message={warningMessage} type="warning" showIcon style={{ display: warningMessage === '' ? 'none' : '' }} />
        <FormItem label={label}>
          {getFieldDecorator('actDate', {
            rules: [{
              type: 'object', required: true, message: ruleMsg,
            }],
          })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.handleDateChange} allowClear={false} style={{ width: 180 }} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleOk} disabled={okButtonDisabled}>确定</Button>
          <Button type="danger" onClick={this.handleCancel} style={{ marginLeft: 8 }} disabled={cancelButtonDisabled}>取消{typeText}</Button>
        </FormItem>
      </Form>
    );
    return (
      <Popover title={<div>{title} {shipmtNo}<Button shape="circle" icon="close" onClick={this.handleClose} /></div>}
        placement="rightTop"
        trigger="click"
        content={content}
        visible={this.state.visible}
        onVisibleChange={this.handleShowPopover}
      >
        <a className={`pickupDeliver${shipmtNo}`}>{this.props.children}</a>
      </Popover>
    );
  }
}
