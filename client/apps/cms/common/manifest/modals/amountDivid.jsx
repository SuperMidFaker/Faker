import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Alert, Form, Modal, InputNumber, notification, Select, Row, Col, message } from 'antd';
import { closeAmountModel, editBillBody, loadBillBody } from 'common/reducers/cmsManifest';
import { dividAmount } from '../tabpane/helper';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    visibleAmtModal: state.cmsManifest.visibleAmtModal,
    billBodies: state.cmsManifest.billBodies,
    billMeta: state.cmsManifest.billMeta,
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: `${cr.curr_name}`,
      search: `${cr.curr_code}${cr.curr_symb}${cr.curr_name}`,
      rate_cny: cr.rate_CNY,
      rate_fore: cr.rate_fore,
    })),
  }),
  { closeAmountModel, editBillBody, loadBillBody }
)
@Form.create()
export default class AmountModel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visibleAmtModal: PropTypes.bool.isRequired,
    billBodies: PropTypes.array,
    billMeta: PropTypes.shape({
      bill_seq_no: PropTypes.string.isRequired,
    }),
    currencies: PropTypes.array.isRequired,
  }
  state = {
    amount: null,
    currency: null,
  }
  handleAmountChange = (value) => {
    this.setState({ amount: value });
  }
  handleSelect = (val) => {
    this.setState({ currency: val });
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
    const currency = this.state.currency;
    if (currency === null) {
      return message.warning('请选择币制');
    }
    const amtCurr = this.props.currencies.find(cr => cr.value === currency);
    let sameCurr = true;
    for (let i = 1; i < bodies; i++) {
      if (bodies[i].trade_curr !== bodies[0].trade_curr) {
        sameCurr = false;
        break;
      }
    }
    let amts = [];
    if (sameCurr && currency === bodies[0].trade_curr) {
      amts = dividAmount(bodies.map(bd => bd.trade_total), amount);
    } else if (sameCurr && currency !== bodies[0].trade_curr) {
      const trdCurr = this.props.currencies.find(cr => cr.value === bodies[0].trade_curr);
      const newAmount = amount * amtCurr.rate_cny * trdCurr.rate_fore; // 转为和表体相同币制
      amts = dividAmount(bodies.map(bd => bd.trade_total), newAmount);
    } else if (!sameCurr) {
      const newAmount = amount * amtCurr.rate_cny; // 转为人民币
      const cnyBodies = [];
      for (let i = 0; i < bodies.length; i++) {
        const trdCurr = this.props.currencies.find(cr => cr.value === bodies[i].trade_curr);
        const tradeTotCny = trdCurr ? bodies[i].trade_total * trdCurr.rate_cny : bodies[i].trade_total;
        cnyBodies.push(tradeTotCny);
      }
      const cnyAmts = dividAmount(cnyBodies, newAmount);
      for (let i = 0; i < bodies.length; i++) {
        const trdCurr = this.props.currencies.find(cr => cr.value === bodies[i].trade_curr);
        const amt = cnyAmts[i] * trdCurr.rate_fore;
        amts.push(amt);
      }
    }
    const proms = [];
    for (let i = 0; i < bodies.length; i++) {
      const decPrice = amts[i] / bodies[i].g_qty;
      proms.push(this.props.editBillBody({ ...bodies[i], trade_total: amts[i], dec_price: decPrice }));
    }
    Promise.all(proms).then(() => {
      this.props.loadBillBody(this.props.billMeta.bill_seq_no);
      this.props.closeAmountModel();
      notification.success({
        message: '操作成功',
        description: `总金额: ${amount} ${amtCurr.text} 已平摊`,
      });
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visibleAmtModal, currencies } = this.props;
    return (
      <Modal maskClosable={false} title="金额平摊" visible={visibleAmtModal}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Alert message="将按每项申报总价的占比重新分摊输入的总金额" type="info" showIcon />
        <Row>
          <Col sm={24} lg={16}>
            <FormItem label="待分摊总金额" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              <InputNumber min={0} onChange={this.handleAmountChange} value={this.state.amount} style={{ width: '80%' }} />
            </FormItem>
          </Col>
          <Col sm={24} lg={8}>
            <FormItem>
              <Select showSearch showArrow optionFilterProp="search" style={{ width: '100%' }} placeholder="币制必填" onChange={this.handleSelect} >
                {
                  currencies.map(data => (
                    <Option key={data.value} search={`${data.search}`} >
                      {`${data.value} | ${data.text}`}
                    </Option>))}
              </Select>
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}

