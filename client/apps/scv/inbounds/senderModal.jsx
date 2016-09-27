import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Form, Select, message } from 'antd';
import { closeEfModal, fillEntryId } from 'common/reducers/scvinbound';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.scvinbound.visibleEfModal,
    entryHeadId: state.scvinbound.efModal.entryHeadId,
    billSeqNo: state.scvinbound.efModal.billSeqNo,
    delgNo: state.scvinbound.efModal.delgNo,
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
    reload: PropTypes.func.isRequired,
    reloadDelgs: PropTypes.func.isRequired,
  }
  state = {
    entryNo: '',
  }
  handleEntryNoChange = (ev) => {
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
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ entryNo: '' });
          this.props.closeEfModal();
          this.props.reload();
          if (result.data.declared) {
            this.props.reloadDelgs();
          }
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
        <Form horinzontal>
          <Select />
        </Form>
      </Modal>
    );
  }
}

