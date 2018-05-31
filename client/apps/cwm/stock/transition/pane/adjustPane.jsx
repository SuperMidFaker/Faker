import React from 'react';
import { connect } from 'react-redux';
import { message, Button, Form, Row, Input, Col, InputNumber } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { adjustTransit } from 'common/reducers/cwmTransition';
import FormPane from 'client/components/FormPane';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@injectIntl
@connect(
  state => ({
    loginName: state.account.username,
    detail: state.cwmTransition.transitionModal.detail,
  }),
  { adjustTransit }
)
export default class AdjustPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    adjustQty: null,
    finalQty: null,
    reason: null,
  }
  handleAdjustQty = (value) => {
    const adjust = parseFloat(value);
    if (!isNaN(adjust) && adjust !== 0) { // eslint-disable-line
      const { detail } = this.props;
      if (detail.avail_qty + adjust > 0) {
        this.setState({ adjustQty: adjust, finalQty: detail.avail_qty + adjust });
        return;
      }
    }
    this.setState({ adjustQty: null, finalQty: null });
  }
  handleFinalQty = (value) => {
    const final = parseFloat(value);
    if (!isNaN(final) && final > 0) { // eslint-disable-line
      const { detail } = this.props;
      this.setState({ adjustQty: final - detail.avail_qty, finalQty: final });
    } else {
      this.setState({ adjustQty: null, finalQty: null });
    }
  }
  handleReasonChange = (ev) => {
    this.setState({ reason: ev.target.value });
  }
  handleAdjustTransit = () => {
    if (this.state.adjustQty) {
      const { loginName } = this.props;
      this.props.adjustTransit(this.props.detail.trace_id, this.state, loginName).then((result) => {
        if (!result.error) {
          message.success('库存数量调整成功');
        } else {
          message.error(result.error.message);
        }
      });
    }
  }
  render() {
    const { adjustQty, finalQty, reason } = this.state;
    return (
      <FormPane descendant>
        <Row>
          <Col lg={{ span: 12 }} xl={{ span: 8 }}>
            <FormItem {...formItemLayout} label="增减数量">
              <InputNumber
                min={-this.props.detail.avail_qty + 1}
                value={adjustQty}
                onChange={this.handleAdjustQty}
                formatter={value => (value > 0 ? `+${value}` : value)}
              />
            </FormItem>
          </Col>
          <Col lg={{ span: 12 }} xl={{ span: 8 }}>
            <FormItem {...formItemLayout} label="目标数量">
              <InputNumber min={1} value={finalQty} onChange={this.handleFinalQty} />
            </FormItem>
          </Col>
          <Col lg={{ span: 12 }} xl={{ span: 8 }}>
            <FormItem {...formItemLayout} label="调整原因">
              <Input value={reason} onChange={this.handleReasonChange} />
            </FormItem>
          </Col>
        </Row>
        <Button type="primary" onClick={this.handleAdjustTransit}>执行调整</Button>
      </FormPane>
    );
  }
}
