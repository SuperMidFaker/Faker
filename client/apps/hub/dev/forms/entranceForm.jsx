import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Divider, Form, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@Form.create()
export default class EntranceForm extends Component {
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
        <FormItem label={<Checkbox>{this.msg('homeEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('home_entrance_url', {
              initialValue: app.home_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox>{this.msg('sofEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('sof_entrance_url', {
              initialValue: app.sof_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox>{this.msg('cmsEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('cms_entrance_url', {
              initialValue: app.cms_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox>{this.msg('bwmEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('bwm_entrance_url', {
              initialValue: app.bwm_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox>{this.msg('tmsEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('tms_entrance_url', {
              initialValue: app.home_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox>{this.msg('bssEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('bss_entrance_url', {
              initialValue: app.bss_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save">{this.msg('save')}</Button>
        </FormItem>
        <Divider />
      </Form>
    );
  }
}
