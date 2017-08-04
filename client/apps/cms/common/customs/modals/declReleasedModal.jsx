import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Form, Modal, Input, DatePicker, message } from 'antd';
import { closeDeclReleasedModal, setDeclReleased } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDeclare.visibleClearModal,
    entry: state.cmsDeclare.clearFillModal,
  }),
  { closeDeclReleasedModal, setDeclReleased }
)
export default class DeclReleasedModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    entry: PropTypes.shape({ preEntrySeqNo: PropTypes.string.isRequired }),
    reload: PropTypes.func.isRequired,
  }
  state = {
    entryNo: '',
    clearTime: null,
    ieTime: null,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entry !== this.props.entry) {
      this.setState({ entryNo: nextProps.entry.entryNo });
    }
  }
  handleEntryNoChange = (ev) => {
    if (ev.target.value) {
      const declno = ev.target.value.trim();
      this.setState({ entryNo: declno });
    } else {
      this.setState({ entryNo: '' });
    }
  }
  handleClearDateChange = (clearDt) => {
    this.setState({ clearTime: clearDt.valueOf() });
  }
  handleIEDateChange = (ieDate) => {
    this.setState({ ieTime: ieDate.valueOf() });
  }
  handleCancel = () => {
    this.props.closeDeclReleasedModal();
  }
  handleOk = () => {
    if (!this.state.entryNo || this.state.entryNo.length !== 18) {
      message.error('报关单号长度应为18位数字', 10);
      return;
    }
    if (!this.state.clearTime) {
      message.error('放行时间未填写', 10);
      return;
    }
    const { entry } = this.props;
    this.props.setDeclReleased({
      delgNo: entry.delgNo,
      preEntrySeqNo: entry.preEntrySeqNo,
      entryNo: this.state.entryNo === entry.entryNo ? null : this.state.entryNo,
      clearTime: this.state.clearTime,
      ieTime: this.state.ieTime,
    }).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ entryNo: '', clearTime: null });
          this.handleCancel();
          this.props.reload();
        }
      });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible, entry } = this.props;
    const entryNo = this.state.entryNo;
    const ieLabel = entry.ietype === 0 ? '进口日期' : '出口日期';
    return (
      <Modal title={this.msg('customsClearModalTitle')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="海关编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Input onChange={this.handleEntryNoChange} value={entryNo} size="large" />
          </FormItem>
          <FormItem label="放行时间" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <DatePicker onChange={this.handleClearDateChange} value={this.state.clearTime && moment(this.state.clearTime)}
              style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" showTime
            />
          </FormItem>
          <FormItem label={ieLabel} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <DatePicker onChange={this.handleIEDateChange} value={this.state.ieTime && moment(this.state.ieTime)}
              style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" showTime
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
