import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, DatePicker, message } from 'antd';
import { closeClearModal, clearCustoms } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDeclare.visibleClearModal,
    entry: state.cmsDeclare.clearModal,
  }),
  { closeClearModal, clearCustoms }
)
export default class DeclnoFillModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    entryNo: '',
    clearTime: null,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.entry !== this.props.entry) {
      this.setState({ entryNo: nextProps.entry_id });
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
  handleCancel = () => {
    this.props.closeClearModal();
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
    this.props.clearCustoms({
      entryHeadId: entry.id,
      entryNo: this.state.entryNo,
      clearTime: this.state.clearTime,
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
    return (
      <Modal title={this.msg('customsClearModal')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="海关单号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Input onChange={this.handleEntryNoChange} value={entryNo} size="large" disabled={entry.entry_id} />
          </FormItem>
          <FormItem label="放行时间" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <DatePicker onChange={this.handleClearChange} value={this.state.clearTime} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
