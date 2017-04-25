import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Form, Modal, InputNumber, notification } from 'antd';
import { closeAmountModel, editBillBody, loadBillBody } from 'common/reducers/cmsManifest';
import { dividAmount } from '../panel/helper';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

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
  handleAmountChange = (value) => {
    this.setState({ amount: value });
  }
  handleCancel = () => {
    this.props.closeAmountModel();
  }
  handleOk = () => {
    const bodies = this.props.billBodies;
    if (bodies.length === 0) {
      return;
    }
    const amount = this.state.amount;
    if (amount === 0) {
      return;
    }
    const amts = dividAmount(bodies.map(bd => bd.trade_total), amount);
    const proms = [];
    for (let i = 0; i < bodies.length; i++) {
      proms.push(this.props.editBillBody({ ...bodies[i], trade_total: amts[i] }));
    }
    Promise.all(proms).then(() => {
      this.props.loadBillBody(this.props.billMeta.bill_seq_no);
      this.props.closeAmountModel();
      notification.success({
        message: '操作成功',
        description: `总金额: ${amount} 已平摊`,
      });
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visibleAmtModal } = this.props;
    return (
      <Modal title={'金额平摊'} visible={visibleAmtModal}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Alert message="将按每项申报总价的占比重新分摊输入的总金额" type="info" showIcon />
        <FormItem label="待分摊总金额">
          <InputNumber min={0} onChange={this.handleAmountChange} value={this.state.amount} />
        </FormItem>
      </Modal>
    );
  }
}

