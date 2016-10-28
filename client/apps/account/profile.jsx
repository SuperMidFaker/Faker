import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Upload, Form, Input, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateProfile } from 'common/reducers/account';
import { isLoginNameExist, checkLoginName } from 'common/reducers/checker-reducer';
import { validatePhone } from 'common/validater';
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
    addonAfter, getFieldDecorator, field, rules, fieldProps,
  } = props;
  return (
    <FormItem label={label} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
      hasFeedback={hasFeedback} required={required}
    >
      {
        getFieldDecorator(field, { rules, ...fieldProps })(
          <Input type="text" addonAfter={addonAfter} placeholder={placeholder} />
        )
      }
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
  getFieldDecorator: PropTypes.func.isRequired,
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
    const { intl, profile, form: { getFieldDecorator }, code } = this.props;
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
      <div className="page-body form-wrapper">
        <Form horizontal onSubmit={this.handleSubmit}>
          <Row>
            <Col xs={20} sm={16} md={12} lg={8}>
              <FormItem label={cmsg('avatar')} className="acc-avatar-form" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} >
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
                getFieldDecorator={getFieldDecorator}
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
                getFieldDecorator={getFieldDecorator}
              />
              <FormInput label={cmsg('phone')} field="phone" required hasFeedback
                rules={[{
                  validator: (rule, value, callback) => validatePhone(
                    value, callback,
                    (msgs, descriptor) => format(msgs)(intl, descriptor)
                  ) }]}
                fieldProps={{ initialValue: profile.phone }}
                getFieldDecorator={getFieldDecorator}
              />
              <FormInput label="Email" field="email" getFieldDecorator={getFieldDecorator}
                rules={[{ type: 'email', message: cmsg('emailError') }]}
                fieldProps={{ initialValue: profile.email }}
              />
            </Col>
          </Row>
          <Row>
            <Col span="18" offset="2">
              <Button size="large" htmlType="submit" type="primary">{formatGlobalMsg(intl, 'ok')}</Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
