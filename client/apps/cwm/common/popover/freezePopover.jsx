import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, Form, Input, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { freezeTransit } from 'common/reducers/cwmTransition';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    loginName: state.account.loginName,
  }),
  { freezeTransit }
)
export default class FreezePopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    availQty: PropTypes.number.isRequired,
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
      qty: e.target.value > this.props.availQty ? this.props.availQty : e.target.value,
    });
  }
  handleReasonChange = (e) => {
    this.setState({
      reason: e.target.value,
    });
  }
  handleConfirm = () => {
    const { loginName, traceId } = this.props;
    const { qty, reason } = this.state;
    if (!qty) {
      message.info('请输入冻结数量');
      return;
    }
    this.props.freezeTransit([traceId], { reason }, loginName, Number(qty)).then((result) => {
      if (!result.error) {
        this.props.reload();
        this.setState({
          visible: false,
          qty: '',
          reason: '',
        });
      }
    });
  }
  render() {
    const { qty, reason } = this.state;
    const content = (
      <div style={{ width: 200 }}>
        <Form layout="vertical" className="form-layout-compact">
          <FormItem label="冻结数量">
            <Input type="number" value={qty} onChange={this.handleQtyChange} />
          </FormItem>
          <FormItem label="冻结原因">
            <Input value={reason} onChange={this.handleReasonChange} />
          </FormItem>
          <FormItem>
            <Button type="primary" onClick={this.handleConfirm} style={{ width: '100%' }}>确认</Button>
          </FormItem>
        </Form>
      </div>
    );
    return (
      <Popover content={content} title="库存冻结" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="small">{<span className="text-success">{this.props.availQty}</span>}</Button>
      </Popover>
    );
  }
}
