import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, Form, Input, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { freezeTransit, adjustTransit } from 'common/reducers/cwmTransition';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginName: state.account.loginName,
  }),
  { freezeTransit, adjustTransit }
)
export default class frozonPopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    text: PropTypes.string.isRequired,
    traceId: PropTypes.string.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    visible: false,
    adjustQty: null,
    finalQty: null,
    reason: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  handleAdjustChange = (value) => {
    const adjust = parseFloat(value);
    if (!isNaN(adjust) && adjust !== 0) {
      const { text } = this.props;
      if (text + adjust > 0) {
        this.setState({ adjustQty: adjust, finalQty: text + adjust });
      }
    }
  }
  handleReasonChange = (e) => {
    this.setState({
      reason: e.target.value,
    });
  }
  handleFinalChange = (value) => {
    const final = parseFloat(value);
    if (!isNaN(final) && final > 0) {
      const { text } = this.props;
      this.setState({ adjustQty: final - text, finalQty: final });
    } else {
      this.setState({ adjustQty: null, finalQty: null });
    }
  }
  handleConfirm = () => {
    const { tenantId, loginName, traceId } = this.props;
    const { adjustQty, reason, finalQty } = this.state;
    if (!Math.abs(adjustQty)) {
      message.info('请输入调整数量');
      return;
    }
    this.props.adjustTransit(traceId, { adjustQty, finalQty, reason }, loginName, tenantId).then((result) => {
      if (!result.error) {
        this.props.reload();
        this.setState({
          visible: false,
          adjustQty: null,
          finalQty: null,
          reason: '',
        });
      }
    });
  }
  render() {
    const { text } = this.props;
    const { adjustQty, reason, finalQty } = this.state;
    const content = (
      <div style={{ width: 200 }}>
        <Form layout="vertical" className="form-layout-compact">
          <FormItem label="增减数量">
            <Input type="number" value={adjustQty} onChange={e => this.handleAdjustChange(e.target.value)} />
          </FormItem>
          <FormItem label="目标数量">
            <Input type="number" value={finalQty} onChange={e => this.handleFinalChange(e.target.value)} />
          </FormItem>
          <FormItem label="调整原因">
            <Input value={reason} onChange={this.handleReasonChange} />
          </FormItem>
          <FormItem>
            <Button type="primary" onClick={this.handleConfirm} style={{ width: '100%' }}>确认</Button>
          </FormItem>
        </Form>
      </div>
    );
    return (
      <Popover content={content} title="货品信息" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="middle">{<span className="cell-align-right text-emphasis">{text}</span>}</Button>
      </Popover>
    );
  }
}
