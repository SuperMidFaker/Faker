import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Divider, Form, Input, Modal, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import AvatarUploader from 'client/components/AvatarUploader';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { confirm } = Modal;

@injectIntl
@Form.create()
export default class ProfileForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    app: PropTypes.shape({
      app_id: PropTypes.string.isRequired,
    }),
  }
  msg = formatMsg(this.props.intl)
  handleDeleteApp = () => {
    confirm({
      title: '确认删除此应用吗?',
      content: '删除应用后将不可恢复',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
      },
      onCancel() {
      },
    });
  }
  render() {
    const { form: { getFieldDecorator }, app } = this.props;
    return (
      <Form>
        <Row gutter={16}>
          <Col span={6}>
            <FormItem label={this.msg('appLogo')}>
              {getFieldDecorator('app_logo', {
                initialValue: app.app_logo,
              })(<AvatarUploader />)}
            </FormItem>
          </Col>
          <Col span={18}>
            <FormItem label={this.msg('appName')}>
              {getFieldDecorator('app_name', {
                initialValue: app.app_name,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
            <FormItem label={this.msg('appDesc')}>
              {getFieldDecorator('app_desc', {
                initialValue: app.app_desc,
              })(<Input.TextArea placeholder="简要描述一下应用" />)}
            </FormItem>
          </Col>
        </Row>
        <FormItem>
          <Button type="primary" icon="save">{this.msg('save')}</Button>
        </FormItem>
        <Divider />
        <Row gutter={16}>
          <Col span={12}>
            <FormItem label={this.msg('appId')}>
              {getFieldDecorator('app_id', {
              initialValue: app.app_id,
            })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('appSecret')}>
              {getFieldDecorator('app_secret', {
              initialValue: app.app_secret,
            })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Divider />
        <FormItem>
          {app.status === 0 ? <Button icon="play-circle">上线</Button> : <Button icon="pause-circle-o">下线</Button>}
          <Button type="danger" icon="delete" style={{ marginLeft: 8 }} onClick={this.handleDeleteApp}>{this.msg('delete')}</Button>
        </FormItem>
      </Form>
    );
  }
}
