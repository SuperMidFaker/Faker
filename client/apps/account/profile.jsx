import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Avatar, Button, Card, Upload, Form, Input, Icon, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateProfile } from 'common/reducers/account';
import { validatePhone } from 'common/validater';
import { getFormatMsg } from 'client/util/react-ant';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';
import './account.less';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);
const FormItem = Form.Item;

function FormInput(props) {
  const {
    label, hasFeedback, required, placeholder,
    addonAfter, getFieldDecorator, field, rules, fieldProps,
  } = props;
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
  };
  return (
    <FormItem {...formItemLayout} label={label}
      hasFeedback={hasFeedback} required={required}
    >
      {
        getFieldDecorator(field, { rules, ...fieldProps })(<Input type="text" addonAfter={addonAfter} placeholder={placeholder} />)
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
  { updateProfile }
)
@connectNav({
  depth: 3,
  jumpOut: true,
})
@Form.create()
export default class MyProfile extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    profile: PropTypes.shape({
      avatar: PropTypes.string,
      name: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      email: PropTypes.string,
    }).isRequired,
    role: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    parentTenantId: PropTypes.number.isRequired,
    updateProfile: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    avatar: this.props.profile.avatar,
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
        this.props.updateProfile(profile, this.props.code, this.props.tenantId).then((result) => {
          if (result.error) {
            message.error(getFormatMsg(result.error.message, this.msg), 10);
          } else {
            message.success('个人信息更新成功');
            // this.context.router.goBack();
          }
        });
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
    const { intl, profile, form: { getFieldDecorator } } = this.props;
    const cmsg = descriptor => formatContainerMsg(intl, descriptor);

    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };
    const uploadProps = {
      action: `${API_ROOTS.default}v1/upload/img/`,
      multiple: false,
      showUploadList: false,
      onChange: this.handleAvatarChange,
      withCredentials: true,
    };
    return (
      <Card title="个人信息">
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <FormItem {...tailFormItemLayout} style={{ marginBottom: 32 }}>
            <Upload {...uploadProps} className="avatar-uploader">
              {this.state.avatar ? <Avatar src={this.state.avatar} size="large" /> : <Icon type="plus" className="avatar-uploader-trigger" />}
            </Upload>
          </FormItem>
          <FormInput label={cmsg('fullName')} field="name" rules={
                  [{ required: true, min: 2, message: cmsg('fullNameMessage') }]
                } fieldProps={{ initialValue: profile.name }} hasFeedback
            getFieldDecorator={getFieldDecorator}
          />
          <FormInput label={cmsg('phone')} field="phone" hasFeedback
            rules={[{
              validator: (rule, value, callback) => validatePhone(
                    value, callback,
                    (msgs, descriptor) => format(msgs)(intl, descriptor)
                  ),
}]}
            fieldProps={{ initialValue: profile.phone }}
            getFieldDecorator={getFieldDecorator}
          />
          <FormInput label="Email" field="email" getFieldDecorator={getFieldDecorator}
            rules={[{ type: 'email', message: cmsg('emailError') }]}
            fieldProps={{ initialValue: profile.email }}
          />
          <FormItem {...tailFormItemLayout}>
            <Button size="large" htmlType="submit" type="primary">{formatGlobalMsg(intl, 'save')}</Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}
