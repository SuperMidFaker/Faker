import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Upload, Form, Input, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateProfile } from 'common/reducers/account';
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

function FormInput(props) {
  const {
    label, hasFeedback, required, placeholder,
    addonAfter, getFieldProps, field, rules, fieldProps,
  } = props;
  return (
    <FormItem label={label} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
      hasFeedback={hasFeedback} required={required}
    >
      <Input type="text" addonAfter={addonAfter} placeholder={placeholder}
        {...getFieldProps(field, { rules, ...fieldProps })}
      />
    </FormItem>
  );
}

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  hasFeedback: PropTypes.bool,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  addonAfter: PropTypes.string,
  field: PropTypes.string,
  rules: PropTypes.array,
  getFieldProps: PropTypes.func,
  fieldProps: PropTypes.object,
};
@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    role: state.account.role_name,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    code: state.account.code,
  }),
  { updateProfile, checkLoginName }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 1,
  }));
})
@Form.create()
export default class MyProfile extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    profile: PropTypes.shape({
      name: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      email: PropTypes.string,
    }).isRequired,
    role: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    parentTenantId: PropTypes.number.isRequired,
    checkLoginName: PropTypes.func.isRequired,
    updateProfile: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    avatar: '',
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values);
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const profile = {
          ...this.props.profile,
          ...this.props.form.getFieldsValue(),
          avatar: this.state.avatar,
          role: this.props.role,
        };
        this.props.updateProfile(profile, this.props.code, this.props.tenantId).then(
          (result) => {
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
        this.setState({
          avatar: upfile.response.data,
        });
      } else {
        message.error(upfile.response.msg);
      }
    }
  }
  render() {
    const { intl, profile, form: { getFieldProps }, code } = this.props;
    const cmsg = descriptor => formatContainerMsg(intl, descriptor);
    const uploadProps = {
      action: `${API_ROOTS.default}v1/upload/img/`,
      multiple: false,
      showUploadList: false,
      onChange: this.handleAvatarChange,
      withCredentials: true,
    };
    const initialAvatar = profile.avatar || `${__CDN__}/assets/img/avatar.jpg`;
    return (
      <div className="acc-panel">
        <div className="panel-heading">
          <h3>{this.msg('profileTitle')}</h3>
          <Button size="large" onClick={this.handleCancel} style={{ float: 'right' }} icon="left">{formatGlobalMsg(intl, 'back')}</Button>
        </div>
        <div className="panel-body">
          <Form horizontal onSubmit={this.handleSubmit}
            className="form-edit-content offset-right-col"
          >
            <FormItem label={cmsg('avatar')} className="acc-avatar-form" labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <div className="acc-avatar"
                style={{ backgroundImage: `url(${this.state.avatar || initialAvatar})` }}
              />
              <Upload {...uploadProps}>
                <Button type="ghost">
                  <Icon type="upload" />
                  {this.msg('avatarUpdate')}
                </Button>
              </Upload>
            </FormItem>
            <FormInput label={cmsg('fullName')} field="name" required rules={
              [{ required: true, min: 2, message: cmsg('fullNameMessage') }]
            } fieldProps={{ initialValue: profile.name }} hasFeedback
              getFieldProps={getFieldProps}
            />
            <FormInput label={cmsg('username')} required field="username"
              addonAfter={`@${code}`} rules={[{
                validator: (rule, value, callback) => isLoginNameExist(
                value, code, profile.loginId,
                this.props.parentTenantId || this.props.tenantId,
                callback, message, this.props.checkLoginName,
                (msgs, descriptor) => format(msgs)(intl, descriptor)
              ),
              }]} fieldProps={{ initialValue: profile.username }}
              getFieldProps={getFieldProps}
            />
            <FormInput label={cmsg('phone')} field="phone" required hasFeedback
              rules={[{
                validator: (rule, value, callback) => validatePhone(
                value, callback,
                (msgs, descriptor) => format(msgs)(intl, descriptor)
              ) }]}
              fieldProps={{ initialValue: profile.phone }}
              getFieldProps={getFieldProps}
            />
            <FormInput label="Email" field="email" getFieldProps={getFieldProps}
              rules={[{ type: 'email', message: cmsg('emailError') }]}
              fieldProps={{ initialValue: profile.email }}
            />
            <Row>
              <Col span="18" offset="6">
                <Button size="large" htmlType="submit" type="primary">{formatGlobalMsg(intl, 'ok')}</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
