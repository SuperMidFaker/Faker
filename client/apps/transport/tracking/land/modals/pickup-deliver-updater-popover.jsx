import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, DatePicker, message, Popover, Button } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { savePickOrDeliverDate } from 'common/reducers/trackingLandStatus';
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
  { savePickOrDeliverDate }
)
@Form.create()
export default class PickupDeliverUpdaterPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    estDate: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    onOK: PropTypes.func,
    savePickOrDeliverDate: PropTypes.func.isRequired,
  }
  state = {
    visible: false,
  }
  componentDidMount() {
    const { shipmtNo } = this.props;
    window.$(document).click((event) => {
      const pickupDeliverClicked = window.$(event.target).closest(`.pickupDeliver${shipmtNo}`).length > 0;
      const antPopoverClicked = window.$(event.target).closest('.ant-popover').length > 0;
      const calenderClicked = window.$(event.target).closest('.ant-calendar-picker-container').length > 0;
      if (!pickupDeliverClicked && !calenderClicked && !antPopoverClicked && this.state.visible) {
        this.handleClose();
      }
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { form, type, shipmtNo, dispId, onOK, loginId, loginName, tenantId, tenantName } = this.props;
        const { actDate } = form.getFieldsValue();
        this.props.savePickOrDeliverDate({ type, shipmtNo, dispId, actDate, loginId, tenantId, loginName, tenantName }).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
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
  handleShowPopover = (visible) => {
    if (visible) {
      this.setState({ visible });
    }
  }
  handleDateChange = (date) => {
    const daysDiff = date.diff(new Date(this.props.estDate), 'days');
    if (daysDiff <= -3 || daysDiff >= 3) {
      message.warn('所选时间和预计时间相差较大， 请注意是否选错日期！', 5);
    }
  }
  render() {
    const { shipmtNo, form: { getFieldDecorator } } = this.props;
    const colSpan = 8;
    let title;
    let ruleMsg;
    let label;
    if (this.props.type === 'pickup') {
      title = this.msg('pickupModalTitle');
      ruleMsg = this.msg('pickupTimeMust');
      label = this.msg('pickupActDate');
    } else {
      title = this.msg('deliverModalTitle');
      ruleMsg = this.msg('deliverTimeMust');
      label = this.msg('deliverActDate');
    }
    const content = (
      <Form className="row" style={{ width: '300px' }}>
        <FormItem label={label} labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }} required >
          {getFieldDecorator('actDate', {
            rules: [{
              type: 'object', required: true, message: ruleMsg,
            }],
          })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.handleDateChange}/>)}
        </FormItem>
        <FormItem wrapperCol={{ span: 16, offset: 8 }}>
          <Button type="primary" htmlType="submit" onClick={this.handleOk}>确定</Button>
          <Button type="ghost" onClick={this.handleClose} style={{ marginLeft: 16 }}>取消</Button>
        </FormItem>
      </Form>
    );
    return (
      <Popover title={`${title} ${shipmtNo}`}
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
