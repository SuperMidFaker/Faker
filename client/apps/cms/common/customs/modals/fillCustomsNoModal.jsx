import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, message } from 'antd';
import { closeEfModal } from 'common/reducers/cmsDelegation';
import { fillEntryId } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.visibleEfModal,
    entryHeadId: state.cmsDelegation.efModal.entryHeadId,
    billSeqNo: state.cmsDelegation.efModal.billSeqNo,
    delgNo: state.cmsDelegation.efModal.delgNo,
  }),
  { closeEfModal, fillEntryId }
)
export default class FillCustomsNoModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    entryHeadId: PropTypes.number.isRequired,
    billSeqNo: PropTypes.string.isRequired,
    delgNo: PropTypes.string.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    entryNo: '',
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
    this.props.closeEfModal();
  }
  handleOk = () => {
    if (this.state.entryNo.length !== 18) {
      message.error('报关单号长度应为18位数字', 10);
      return;
    }
    this.props.fillEntryId({
      entryHeadId: this.props.entryHeadId,
      entryNo: this.state.entryNo,
      billSeqNo: this.props.billSeqNo,
      delgNo: this.props.delgNo,
    }).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ entryNo: '' });
          this.props.closeEfModal();
          this.props.reload();
        }
      });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible } = this.props;
    return (
      <Modal title={this.msg('entryNoFillModalTitle')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="海关编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            <Input onChange={this.handleEntryNoChange} value={this.state.entryNo} size="large" />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
