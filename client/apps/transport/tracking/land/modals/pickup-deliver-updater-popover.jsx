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
  }),
  { savePickOrDeliverDate }
)
@Form.create()
export default class PickupDeliverUpdaterPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
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
  // componentWillUnmount() {
  //   window.$(document).unbind('click');
  // }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    this.props.form.validateFields(errors => {
      if (!errors) {
        const { form, type, shipmtNo, dispId, onOK, loginId, loginName, tenantId } = this.props;
        const { actDate } = form.getFieldsValue();
        this.props.savePickOrDeliverDate({ type, shipmtNo, dispId, actDate, loginId, tenantId, loginName }).then(
          result => {
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
  handleShowPopover = () => {
    this.setState({ visible: true });
  }
  render() {
    const { shipmtNo, form: { getFieldProps } } = this.props;
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
          <DatePicker showTime format="yyyy-MM-dd HH:mm:ss"
            {...getFieldProps('actDate', {
              rules: [{
                type: 'date', required: true, message: ruleMsg,
              }],
            })}
          />
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
      >
        <a className={`pickupDeliver${shipmtNo}`} onClick={ev => {
          ev.preventDefault();
          ev.stopPropagation();
          this.handleShowPopover();
        }}>{this.props.children}</a>
      </Popover>
    );
  }
}
