import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, message } from 'antd';
import { closeCiqModal, fillCustomsNo } from 'common/reducers/cmsDelegation';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.visibleCiqModal,
    delgNo: state.cmsDelegation.ciqModal.delgNo,
    entryHeadId: state.cmsDelegation.ciqModal.entryHeadId,
  }),
  { closeCiqModal, fillCustomsNo }
)
export default class CiqnoFillModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    delgNo: PropTypes.string.isRequired,
    entryHeadId: PropTypes.number.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    entryNo: '',
  }
  handleEntryNoChange = (ev) => {
    this.setState({ entryNo: ev.target.value });
  }
  handleCancel = () => {
    this.props.closeCiqModal();
  }
  handleOk = () => {
    this.props.fillCustomsNo({
      entryNo: this.state.entryNo,
      entryHeadId: this.props.entryHeadId,
      delgNo: this.props.delgNo,
    }).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ entryNo: '' });
          this.props.closeCiqModal();
          this.props.reload();
        }
      });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible } = this.props;
    return (
      <Modal maskClosable={false} title={this.msg('ciqNoFillModalTitle')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Input onChange={this.handleEntryNoChange} value={this.state.entryNo} />
      </Modal>
    );
  }
}

