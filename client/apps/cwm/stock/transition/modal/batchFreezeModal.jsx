import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { message, Input, Modal, Alert, Form } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { closeBatchFreezeModal, freezeTransit, unfreezeTransit } from 'common/reducers/cwmTransition';

const formatMsg = format(messages);
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};

@injectIntl
@connect(
  state => ({
    loginName: state.account.username,
    batchFreezeModal: state.cwmTransition.batchFreezeModal,
  }),
  { closeBatchFreezeModal, freezeTransit, unfreezeTransit }
)
export default class BatchFreezeModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    batchFreezeModal: PropTypes.shape({
      visible: PropTypes.bool.isRequired,
      freezed: PropTypes.bool.isRequired,
    }),
  }
  state = {
    reason: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.closeBatchFreezeModal({ needReload: false });
    this.setState({
      reason: '',
    });
  }
  handleReasonChange = (ev) => {
    this.setState({ reason: ev.target.value });
  }
  handleSubmit = () => {
    let transitOp;
    const { batchFreezeModal, loginName } = this.props;
    if (batchFreezeModal.freezed) {
      transitOp = this.props.freezeTransit(batchFreezeModal.traceIds, this.state, loginName);
    } else {
      transitOp = this.props.unfreezeTransit(batchFreezeModal.traceIds, this.state, loginName);
    }
    transitOp.then((result) => {
      if (!result.error) {
        this.props.closeBatchFreezeModal({ needReload: true });
      } else {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { reason } = this.state;
    const { batchFreezeModal } = this.props;
    const actionTxt = batchFreezeModal.freezed ? '冻结' : '解冻';
    return (
      <Modal maskClosable={false} title={`批量${actionTxt}`} onCancel={this.handleCancel} visible={batchFreezeModal.visible}
        onOk={this.handleSubmit} okText={`确认${actionTxt}`}
      >
        <Alert message={`已选择${batchFreezeModal.traceIds.length}项库存数量`} type="info" />
        <FormItem {...formItemLayout} label={`${actionTxt}原因`}>
          <Input value={reason} onChange={this.handleReasonChange} />
        </FormItem>
      </Modal>
    );
  }
}
