import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, message } from 'antd';
import { closeEfModal, fillEntryId } from 'common/reducers/cmsDelegation';
import { format } from 'client/common/i18n/helpers';
import messages from '../declare/message.i18n';
const formatMsg = format(messages);

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
export default class DeclnoFillModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    entryHeadId: PropTypes.number.isRequired,
    billSeqNo: PropTypes.string.isRequired,
    delgNo: PropTypes.string.isRequired,
  }
  state = {
    entryNo: '',
  }
  handleEntryNoChange = ev => {
    this.setState({ entryNo: ev.target.value });
  }
  handleCancel = () => {
    this.props.closeEfModal();
  }
  handleOk = () => {
    this.props.fillEntryId({
      entryHeadId: this.props.entryHeadId, entryNo: this.state.entryNo,
      billSeqNo: this.props.billSeqNo, delgNo: this.props.delgNo,
    }).then(
      result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ entryNo: '' });
          this.props.closeEfModal();
          this.props.reload();
        }
      });
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible } = this.props;
    return (
      <Modal title={this.msg('entryNoFillModalTitle')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Input onChange={this.handleEntryNoChange} value={this.state.entryNo} />
      </Modal>
    );
  }
}

