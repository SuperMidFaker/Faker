import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Input, Radio, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { SCOF_ORDER_TRANSFER } from 'common/constants';
import { updateAppStatus, deleteApp } from 'common/reducers/openIntegration';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    app: state.openIntegration.currentApp,
  }),
  { updateAppStatus, deleteApp }
)
@Form.create()
export default class TypeForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, app } = this.props;
    return (
      <Form>
        <FormItem label={this.msg('orderType')}>
          {getFieldDecorator('type', {
            initialValue: app.type,
            rules: [{ required: true, message: this.msg('parameterRequired') }],
          })(<Input />)}
        </FormItem>
        <FormItem label={this.msg('orderTransfer')}>
          {getFieldDecorator('order_transfer', {
            initialValue: app.order_transfer,
            rules: [{ required: true, message: this.msg('parameterRequired') }],
          })(<RadioGroup>
            {SCOF_ORDER_TRANSFER.map(sot =>
              (<RadioButton value={sot.value} key={sot.value}>
                {sot.text}: {sot.desc}</RadioButton>))}
          </RadioGroup>)}
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save">{this.msg('save')}</Button>
        </FormItem>
      </Form>
    );
  }
}
