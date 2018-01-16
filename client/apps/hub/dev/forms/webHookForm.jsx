import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Input, Divider, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateHookUrl } from 'common/reducers/devApp';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@Form.create()
@connect(
  () => ({}),
  { updateHookUrl }
)
export default class WebHookForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    app: PropTypes.shape({
      send_dir: PropTypes.string.isRequired,
    }),
  }
  msg = formatMsg(this.props.intl)
  handleSave = () => {
    const { app } = this.props;
    const data = this.props.form.getFieldsValue();
    this.props.updateHookUrl(data.hook_url, app.id).then((result) => {
      if (!result.error) {
        message.success('更新成功');
      }
    });
  }
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
          <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
        </FormItem>
        <Divider />
      </Form>
    );
  }
}
