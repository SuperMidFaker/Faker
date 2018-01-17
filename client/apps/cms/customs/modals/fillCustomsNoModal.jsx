import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, message } from 'antd';
import { closeEfModal } from 'common/reducers/cmsDelegation';
import { fillEntryId } from 'common/reducers/cmsManifest';
import { validateEntryId } from 'common/reducers/cmsCustomsDeclare';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.cmsDelegation.visibleEfModal,
    entryHeadId: state.cmsDelegation.efModal.entryHeadId,
    billSeqNo: state.cmsDelegation.efModal.billSeqNo,
    delgNo: state.cmsDelegation.efModal.delgNo,
  }),
  { closeEfModal, fillEntryId, validateEntryId }
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
    validateStatus: '',
  }
  handleEntryNoChange = (ev) => {
    if (ev.target.value) {
      const declno = ev.target.value.trim();
      if (declno.length === 18) {
        this.setState({
          entryNo: declno,
          validateStatus: 'validating',
        });
        this.props.validateEntryId(declno).then((result) => {
          if (!result.error) {
            this.setState({
              validateStatus: result.data.exist ? 'error' : 'success',
            });
          }
        });
      } else {
        this.setState({
          entryNo: declno,
          validateStatus: '',
        });
      }
    } else {
      this.setState({ entryNo: '', validateStatus: '' });
    }
  }
  handleCancel = () => {
    this.props.closeEfModal();
  }
  handleOk = () => {
    if (this.state.validateStatus === 'error') {
      message.error('海关编号已存在');
      return;
    }
    if (this.state.entryNo.length !== 18) {
      message.error('报关单号长度应为18位数字', 10);
      return;
    }
    this.props.fillEntryId({
      entryHeadId: this.props.entryHeadId,
      entryNo: this.state.entryNo,
      billSeqNo: this.props.billSeqNo,
      delgNo: this.props.delgNo,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.setState({ entryNo: '' });
        this.props.closeEfModal();
        this.props.reload();
      }
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible } = this.props;
    const { validateStatus, entryNo } = this.state;
    let validate = null;
    if (entryNo.length === 18) {
      validate = { validateStatus };
    }
    return (
      <Modal
        maskClosable={false}
        title={this.msg('entryNoFillModalTitle')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="海关编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} hasFeedback={entryNo.length === 18} {...validate}>
            <Input onChange={this.handleEntryNoChange} value={this.state.entryNo} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
