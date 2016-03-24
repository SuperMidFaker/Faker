import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Input, Row, Col, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadProfile, setProfileValue, updateProfile } from 'universal/redux/reducers/account';
import { isLoginNameExist, checkLoginName } from 'reusable/domains/redux/checker-reducer';
import { getFormatMsg } from 'reusable/browser-util/react-ant';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
import './acc.less';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const FormItem = Form.Item;

function fetchData({ state, dispatch, cookie }) {
  if (!state.account.profile.loaded) {
    return dispatch(loadProfile(cookie));
  }
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    code: state.account.code
  }),
  { setProfileValue, updateProfile, checkLoginName }
)
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
export default class ChangePassword extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
    checkLoginName: PropTypes.func.isRequired,
    setProfileValue: PropTypes.func.isRequired,
    updateProfile: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  msg = (key) => formatMsg(this.props.intl, key);
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        this.props.updateProfile(this.props.profile, this.props.code).then(
          result => {
            if (error) {
              message.error(getFormatMsg(error.message, this.msg), 10);
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
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const { formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type={type} placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const { intl, formhoc: { getFieldProps, getFieldError }, code } = this.props;
    const isCreating = this.props.formData.key === null;
    const disableSubmit = this.props.tenant.id === -1;
    const msg = (descriptor) => formatMsg(intl, descriptor);
    return (
      <div className="acc-panel">
        <div className="panel-heading">
          <h3>{this.msg('profileTitle')}</h3>
        </div>
        <div className="panel-body">
          <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc}
          className="form-edit-content offset-right-col">
          {/* avatar */}
            {this.renderTextInput(
              msg('fullName'), msg('fullNamePlaceholder'), 'name', true,
              [{required: true, min: 2, message: msg('fullNameMessage')}]
            )}
            <FormItem label={msg('username')} labelCol={{span: 6}} wrapperCol={{span: 18}}
              help={getFieldError('loginName')} hasFeedback required>
              <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
                rules: [{
                  validator: (rule, value, callback) => isLoginNameExist(
                    value, code, this.props.formData.loginId,
                    this.props.tenant.id, callback, message, this.props.checkLoginName,
                    (msgs, descriptor) => format(msgs)(intl, descriptor))
                }]
              })}
              />
            </FormItem>
            {this.renderTextInput(
              msg('phone'), msg('phonePlaceholder'), 'phone', true,
              [{ validator: (rule, value, callback) => validatePhone(value, callback,
                  (msgs, descriptor) => format(msgs)(intl, descriptor)) }]
            )}
            {this.renderTextInput(
              'Email', msg('emailPlaceholder'), 'email', false,
              [{ type: 'email', message: formatContainerMsg(intl, 'emailError') }]
            )}
            <Row>
              <Col span="18" offset="6">
                <Button disabled={ disableSubmit } htmlType="submit" type="primary">
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
