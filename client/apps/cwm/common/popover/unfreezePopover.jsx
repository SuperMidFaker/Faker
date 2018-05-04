import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, Form, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { unfreezeTransit } from 'common/reducers/cwmTransition';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginName: state.account.loginName,
  }),
  { unfreezeTransit }
)
export default class UnfreezePopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    text: PropTypes.string.isRequired,
    traceId: PropTypes.string.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    visible: false,
    qty: '',
    reason: '',
  }
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  handleQtyChange = (e) => {
    this.setState({
      qty: e.target.value > this.props.text ? this.props.text : e.target.value,
    });
  }
  handleReasonChange = (e) => {
    this.setState({
      reason: e.target.value,
    });
  }
  handleConfirm = () => {
    const { loginName, traceId, text } = this.props;
    const { qty, reason } = this.state;
    const unfreezeQty = Number.isNaN(parseFloat(qty)) ? null : parseFloat(qty);
    this.props.unfreezeTransit([traceId], { reason }, loginName, unfreezeQty).then((result) => {
      if (!result.error) {
        this.props.reload(traceId, unfreezeQty || text);
        this.setState({
          visible: false,
          qty: '',
          reason: '',
        });
      }
    });
  }
  render() {
    const { text } = this.props;
    const { qty, reason } = this.state;
    const content = (
      <div style={{ width: 200 }}>
        <Form layout="vertical" className="form-layout-compact">
          <FormItem label="解冻数量">
            <Input type="number" value={qty || text} onChange={this.handleQtyChange} />
          </FormItem>
          <FormItem label="解冻原因">
            <Input value={reason} onChange={this.handleReasonChange} />
          </FormItem>
          <FormItem>
            <Button type="primary" onClick={this.handleConfirm} style={{ width: '100%' }}>确认</Button>
          </FormItem>
        </Form>
      </div>
    );
    return (
      <Popover content={content} title="库存解冻" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="small">{<span className="text-error">{text}</span>}</Button>
      </Popover>
    );
  }
}
