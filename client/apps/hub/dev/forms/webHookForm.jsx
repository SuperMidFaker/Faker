import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Input, Divider } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@Form.create()
export default class WebHookForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    app: PropTypes.shape({
      send_dir: PropTypes.string.isRequired,
    }),
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, app } = this.props;
    return (
      <Form>
        <FormItem label={this.msg('hookUrl')}>
          {getFieldDecorator('hook_url', {
              initialValue: app.hook_url,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save">{this.msg('save')}</Button>
        </FormItem>
        <Divider />
      </Form>
    );
  }
}
