import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, message } from 'antd';
import { closeEfModal, fillEntryNo } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cmsDeclare.visibleEfModal,
    entryHeadId: state.cmsDeclare.efModal.entryHeadId,
    delgNo: state.cmsDeclare.efModal.delgNo,
  }),
  { closeEfModal, fillEntryNo }
)
export default class EntryNoFillModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    entryHeadId: PropTypes.number.isRequired,
    delgNo: PropTypes.string.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    entryNo: ''
  }
  handleEntryNoChange = ev => {
    this.setState({ entryNo: ev.target.value });
  }
  handleCancel = () => {
    this.props.closeEfModal();
  }
  handleOk = () => {
    this.props.fillEntryNo({
      entryHeadId: this.props.entryHeadId, entryNo: this.state.entryNo,
      delgNo: this.props.delgNo,
    }).then(
      result => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ entryNo: '' });
          this.props.closeEfModal();
          if (result.data.needReload) {
            this.props.reload();
          }
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
