import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Upload, Form, Input, Row, Col, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { setProfileValue, updateProfile } from 'common/reducers/account';
import { isLoginNameExist, checkLoginName } from 'common/reducers/checker-reducer';
import { validatePhone } from 'common/validater';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { getFormatMsg } from 'client/util/react-ant';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';
import './acc.less';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    tenantId: state.account.tenantId,
    code: state.account.code
  }),
  { setProfileValue, updateProfile, checkLoginName }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 1
  }));
})
@Form.formify({
  mapPropsToFields(props) {
    return props.profile;
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      props.setProfileValue(name, fields[name].value);
    }
  },
  formPropName: 'formhoc'
})
export default class MyProfile extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
    code: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    checkLoginName: PropTypes.func.isRequired,
    setProfileValue: PropTypes.func.isRequired,
    updateProfile: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values);
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        this.props.updateProfile(this.props.profile, this.props.code, this.props.tenantId).then(
          result => {
            if (result.error) {
              message.error(getFormatMsg(result.error.message, this.msg), 10);
            } else {
              this.context.router.goBack();
            }
          }
        );
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }
  handleAvatarChange = (info) => {
    const upfile = info.file;
    if (upfile.status === 'done') {
      if (upfile.response.status === 200) {
        this.props.setProfileValue('avatar', upfile.response.data);
      } else {
        message.error(upfile.response.msg);
      }
    }
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const { formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const { intl, formhoc: { getFieldProps, getFieldError }, code } = this.props;
    const cmsg = (descriptor) => formatContainerMsg(intl, descriptor);
    const uploadProps = {
      action: '/v1/upload/img',
      multiple: false,
      showUploadList: false,
      onChange: this.handleAvatarChange
    };
    const defaultAvatar = `${__CDN__}/assets/img/avatar.jpg`;
    return (
      <div className="acc-panel">
        <div className="panel-heading">
          <h3>{this.msg('profileTitle')}</h3>
        </div>
        <div className="panel-body">
          <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc}
          className="form-edit-content offset-right-col">
            <FormItem label={cmsg('avatar')} className="acc-avatar-form" labelCol={{span: 6}}
              wrapperCol={{span: 18}}
            >
              <div className="acc-avatar"
                style={{backgroundImage: `url(${this.props.profile.avatar || defaultAvatar})`}}
              />
              <Upload {...uploadProps}>
                <Button type="ghost">
                  <Icon type="upload" />
                  {this.msg('avatarUpdate')}
                </Button>
              </Upload>
            </FormItem>
            {this.renderTextInput(
              cmsg('fullName'), '', 'name', true,
              [{required: true, min: 2, message: cmsg('fullNameMessage')}]
            )}
            <FormItem label={cmsg('username')} labelCol={{span: 6}} wrapperCol={{span: 18}}
              help={getFieldError('loginName')} hasFeedback required>
              <Input type="text" addonAfter={`@${code}`} {...getFieldProps('username', {
                rules: [{
                  validator: (rule, value, callback) => isLoginNameExist(
                    value, code, this.props.profile.loginId,
                    this.props.tenantId, callback, message, this.props.checkLoginName,
                    (msgs, descriptor) => format(msgs)(intl, descriptor))
                }]
              })}
              />
            </FormItem>
            {this.renderTextInput(
              cmsg('phone'), '', 'phone', true,
              [{ validator: (rule, value, callback) => validatePhone(value, callback,
                  (msgs, descriptor) => format(msgs)(intl, descriptor)) }]
            )}
            {this.renderTextInput(
              'Email', '', 'email', false,
              [{ type: 'email', message: cmsg('emailError') }]
            )}
            <Row>
              <Col span="18" offset="6">
                <Button htmlType="submit" type="primary">
                {formatGlobalMsg(intl, 'ok')}
                </Button>
                <Button onClick={this.handleCancel}>
                {formatGlobalMsg(intl, 'back')}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>);
  }
}
