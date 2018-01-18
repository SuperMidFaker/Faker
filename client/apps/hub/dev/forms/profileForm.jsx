import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Col, Divider, Form, Input, Modal, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import AvatarUploader from 'client/components/AvatarUploader';
import { updateBasicInfo, deleteDevApp, toggleStatus, getApp } from 'common/reducers/devApp';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { confirm } = Modal;

@injectIntl
@Form.create()
@connect(
  () => ({}),
  {
    updateBasicInfo, deleteDevApp, toggleStatus, getApp,
  }
)
export default class ProfileForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    app: PropTypes.shape({
      app_id: PropTypes.string.isRequired,
    }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleDeleteApp = (id) => {
    const me = this;
    confirm({
      title: '确认删除此应用吗?',
      content: '删除应用后将不可恢复',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        me.props.deleteDevApp(id).then((result) => {
          if (!result.error) {
            me.context.router.push('/hub/dev');
          }
        });
      },
      onCancel() {
      },
    });
  }
  handleSave = () => {
    const data = this.props.form.getFieldsValue();
    this.props.updateBasicInfo(data.app_id, data.app_logo, data.app_desc, data.app_name);
  }
  afterUpload = (url) => {
    this.props.form.setFieldsValue({
      app_logo: url,
    });
  }
  toggleStatus = (status) => {
    const { app } = this.props;
    this.props.toggleStatus(status, app.id, app.app_id).then((result) => {
      if (!result.error) {
        this.props.getApp(app.app_id);
      }
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
              })(<AvatarUploader url={app.app_logo} afterUpload={this.afterUpload} />)}
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
          <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
        </FormItem>
        <Divider />
        <Row gutter={16}>
          <Col span={10}>
            <FormItem label={this.msg('appId')}>
              {getFieldDecorator('app_id', {
                initialValue: app.app_id,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={14}>
            <FormItem label={this.msg('appSecret')}>
              <Input disabled value={app.app_secret} />
            </FormItem>
          </Col>
        </Row>
        <Divider />
        <FormItem>
          {app.status === 0 ? <Button onClick={() => this.toggleStatus(true)} icon="play-circle">{this.msg('online')}</Button> :
          <Button onClick={() => this.toggleStatus(false)} icon="pause-circle-o">{this.msg('offline')}</Button>}
          <Button type="danger" icon="delete" style={{ marginLeft: 8 }} onClick={() => this.handleDeleteApp(app.id)}>{this.msg('delete')}</Button>
        </FormItem>
      </Form>
    );
  }
}
