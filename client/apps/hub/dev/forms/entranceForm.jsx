import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Checkbox, Divider, Form, Input, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateEntranceUrl } from 'common/reducers/devApp';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@Form.create()
@connect(
  () => ({}),
  { updateEntranceUrl }
)
export default class EntranceForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    app: PropTypes.shape({
      send_dir: PropTypes.string.isRequired,
    }),
  }
  state = {
    home_entrance_url: false,
    sof_entrance_url: false,
    cms_entrance_url: false,
    bwm_entrance_url: false,
    tms_entrance_url: false,
    bss_entrance_url: false,
  }
  componentWillMount() {
    this.setState({
      home_entrance_url: !!this.props.app.home_entrance_url,
      sof_entrance_url: !!this.props.app.sof_entrance_url,
      cms_entrance_url: !!this.props.app.cms_entrance_url,
      bwm_entrance_url: !!this.props.app.bwm_entrance_url,
      tms_entrance_url: !!this.props.app.tms_entrance_url,
      bss_entrance_url: !!this.props.app.bss_entrance_url,
    });
  }
  msg = formatMsg(this.props.intl)
  handleCheckBoxChange = (field, e) => {
    this.setState({
      [field]: e.target.checked,
    });
  }
  handleSave = () => {
    const data = {};
    const formData = this.props.form.getFieldsValue();
    const keys = Object.keys(this.state);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (this.state[key]) {
        data[key] = formData[key];
      } else {
        data[key] = '';
      }
    }
    this.props.updateEntranceUrl(data, this.props.app.id).then((result) => {
      if (!result.error) {
        message.success('更新成功');
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, app } = this.props;
    return (
      <Form>
        <FormItem label={<Checkbox checked={this.state.home_entrance_url} onChange={e => this.handleCheckBoxChange('home_entrance_url', e)}>{this.msg('homeEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('home_entrance_url', {
              initialValue: app.home_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox checked={this.state.sof_entrance_url} onChange={e => this.handleCheckBoxChange('sof_entrance_url', e)}>{this.msg('sofEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('sof_entrance_url', {
              initialValue: app.sof_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox checked={this.state.cms_entrance_url} onChange={e => this.handleCheckBoxChange('cms_entrance_url', e)}>{this.msg('cmsEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('cms_entrance_url', {
              initialValue: app.cms_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox checked={this.state.bwm_entrance_url} onChange={e => this.handleCheckBoxChange('bwm_entrance_url', e)}>{this.msg('bwmEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('bwm_entrance_url', {
              initialValue: app.bwm_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox checked={this.state.tms_entrance_url} onChange={e => this.handleCheckBoxChange('tms_entrance_url', e)}>{this.msg('tmsEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('tms_entrance_url', {
              initialValue: app.tms_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem label={<Checkbox checked={this.state.bss_entrance_url} onChange={e => this.handleCheckBoxChange('bss_entrance_url', e)}>{this.msg('bssEntranceUrl')}</Checkbox>} colon={false}>
          {getFieldDecorator('bss_entrance_url', {
              initialValue: app.bss_entrance_url,
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
        </FormItem>
        <Divider />
      </Form>
    );
  }
}
