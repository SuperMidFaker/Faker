import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, message } from 'antd';
import { closeAmountModel, editBillBody, loadBillBody } from 'common/reducers/cmsManifest';
import { dividAmount } from '../panel/helper';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visibleAmtModal: state.cmsManifest.visibleAmtModal,
    billBodies: state.cmsManifest.billBodies,
    billMeta: state.cmsManifest.billMeta,
  }),
  { closeAmountModel, editBillBody, loadBillBody }
)
export default class AmountModel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visibleAmtModal: PropTypes.bool.isRequired,
    billBodies: PropTypes.array,
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
    }),
  }
  state = {
    amount: null,
  }
  handleAmountChange = (ev) => {
    this.setState({ amount: ev.target.value });
  }
  handleCancel = () => {
    this.props.closeAmountModel();
  }
  handleOk = () => {
    const bodies = this.props.billBodies;
    const amount = this.state.amount;
    const amts = dividAmount(bodies.map(bd => bd.trade_total), amount);
    const proms = [];
    for (let i = 0; i < bodies.length; i++) {
      proms.push(this.props.editBillBody({ ...bodies[i], trade_total: amts[i] }));
    }
    proms.then(() => {
      this.props.loadBillBody(this.props.billMeta.bill_seq_no);
      this.props.closeAmountModel();
      message.success(`总金额: ${amount} 已平摊`, 3);
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visibleAmtModal } = this.props;
    return (
      <Modal title={'分摊总金额'} visible={visibleAmtModal}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Input onChange={this.handleAmountChange} value={this.state.amount} type="number" width="80%" />
      </Modal>
    );
  }
}

