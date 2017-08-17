import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { message, Button, Card, Form, Row, Input, Col, InputNumber } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { hideTransitionDock, adjustTransit } from 'common/reducers/cwmTransition';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginName: state.account.username,
    detail: state.cwmTransition.transitionDock.detail,
  }),
  { hideTransitionDock, adjustTransit }
)
export default class AdjustPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    adjustQty: null,
    finalQty: null,
    reason: null,
  }
  handleAdjustQty = (value) => {
    const adjust = parseFloat(value);
    if (!isNaN(adjust) && adjust !== 0) {
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
    if (!isNaN(final) && final > 0) {
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
      const { loginName, tenantId } = this.props;
      this.props.adjustTransit(this.props.detail.trace_id, this.state, loginName, tenantId).then((result) => {
        if (!result.error) {
          this.props.hideTransitionDock({ needReload: true });
        } else {
          message.error(result.error.message);
        }
      });
    }
  }
  render() {
    const { adjustQty, finalQty, reason } = this.state;
    return (
      <div className="pane-content tab-pane">
        <Form>
          <Card noHovering bodyStyle={{ paddingBottom: 0 }}>
            <Row gutter={16}>
              <Col span={8}>
                <FormItem {...formItemLayout} label="增减数量">
                  <InputNumber min={-this.props.detail.avail_qty + 1} value={adjustQty}
                    onChange={this.handleAdjustQty} formatter={value => value > 0 ? `+${value}` : value}
                  />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="目标数量">
                  <InputNumber min={1} value={finalQty} onChange={this.handleFinalQty} />
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label="调整原因">
                  <Input value={reason} onChange={this.handleReasonChange} />
                </FormItem>
              </Col>
            </Row>
          </Card>
          <Button type="primary" onClick={this.handleAdjustTransit}>执行调整</Button>
        </Form>
      </div>
    );
  }
}
