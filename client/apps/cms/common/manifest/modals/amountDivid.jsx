import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, message } from 'antd';
import { closeAmountModel, editBillBody, loadBillBody } from 'common/reducers/cmsManifest';
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
    billMeta: PropTypes.Object,
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
    let tradeTot = 0;
    bodies.forEach((body) => {
      tradeTot += Number(body.trade_total);
    });
    let tots = 0;
    for (let i = 0; i < bodies.length - 1; i++) {
      const body = bodies[i];
      const tradeT = (amount * body.trade_total / tradeTot).toFixed(3);
      tots += Number(tradeT);
      this.props.editBillBody({ ...body, trade_total: tradeT });
    }
    const lastTot = amount - tots;
    const lastBody = bodies[bodies.length - 1];
    this.props.editBillBody({ ...lastBody, trade_total: lastTot }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.loadBillBody(this.props.billMeta.bill_seq_no);
        this.props.closeAmountModel();
      }
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

