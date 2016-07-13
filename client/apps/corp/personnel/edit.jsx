import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Form, Input, Row, Col, Switch, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { isFormDataLoaded, loadForm, assignForm, clearForm, edit, submit } from
'common/reducers/personnel';
import { setNavTitle } from 'common/reducers/navbar';
import { isLoginNameExist, checkLoginName } from 'common/reducers/checker-reducer';
import { validatePhone } from 'common/validater';
import { TENANT_ROLE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);
const FormItem = Form.Item;

function fetchData({state, dispatch, cookie, params}) {
  const pid = parseInt(params.id, 10);
  if (pid) {
    if (!isFormDataLoaded(state.personnel, pid)) {
      return dispatch(loadForm(cookie, pid));
    } else {
      return dispatch(assignForm(state.personnel, pid));
    }
  } else {
    return dispatch(clearForm());
  }
}

function goBack(router) {
  router.goBack();
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    selectedIndex: state.personnel.selectedIndex,
    formData: state.personnel.formData,
    submitting: state.personnel.submitting,
    code: state.account.code,
    tenant: state.personnel.tenant,
  }),
  { edit, submit, checkLoginName })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle === 'componentDidMount') {
    return;
  }
  const isCreating = props.formData.key === null;
  dispatch(setNavTitle({
    depth: 3,
    text: isCreating ? formatMsg(props.intl, 'newUser') :
      `${formatMsg(props.intl, 'user')}${props.formData.name}`,
    moduleName: 'corp',
    goBackFn: () => goBack(router),
    withModuleLayout: false
  }));
})
@Form.create({
  formPropName: 'formhoc'
})
export default class CorpEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    tenant: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    edit: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    checkLoginName: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  state = {
    role: '',
  }
  onSubmitReturn(error) {
    if (error) {
      message.error(error.message, 10);
    } else {
      goBack(this.context.router);
    }
  }
  handleAdminCheck = (checked) => {
    this.setState({
      role: checked ? TENANT_ROLE.manager.name : TENANT_ROLE.member.name,
    });
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        const form = {
          ...this.props.formData,
          ...this.props.formhoc.getFieldsValue(),
          role: this.state.role || this.props.formData.role,
        };
        if (this.props.formData.key) {
          this.props.edit(form, this.props.code, this.props.tenant.id).then(
            result => this.onSubmitReturn(result.error)
          );
        } else {
          this.props.submit(form, this.props.code, this.props.tenant).then(
            result => this.onSubmitReturn(result.error)
          );
        }
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel = () => {
    goBack(this.context.router);
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps, type = 'text') {
    const { formhoc: { getFieldProps }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}}
        hasFeedback required={required}
      >
        <Input type={type} placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const {
      formData: { name, loginName, password, phone, email, position },
      submitting, intl, formhoc: { getFieldProps }, code,
    } = this.props;
    const isCreating = this.props.formData.key === null;
    const disableSubmit = this.props.tenant.id === -1;
    const msg = (descriptor) => formatMsg(intl, descriptor);
    return (
      <div className="main-content">
        <div className="page-body">
          <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc}
          className="form-edit-content offset-right-col">
            {this.renderTextInput(
              msg('fullName'), msg('fullNamePlaceholder'), 'name', true,
              [{required: true, min: 2, message: msg('fullNameMessage')}],
              { initialValue: name }
            )}
            <FormItem label={msg('username')} labelCol={{span: 6}} wrapperCol={{span: 18}}
            required
            >
              <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
                rules: [{
                  validator: (rule, value, callback) => isLoginNameExist(
                    value, code, this.props.formData.loginId,
                    this.props.tenant.id, callback, message, this.props.checkLoginName,
                    (msgs, descriptor) => format(msgs)(intl, descriptor))
                }],
                initialValue: loginName,
              })}
              />
            </FormItem>
            {
              isCreating && this.renderTextInput(
                msg('password'), msg('passwordPlaceholder'), 'password', true,
                [{required: true, min: 6, message: msg('passwordMessage')}],
                { initialValue: password }, 'password')
            }
            {this.renderTextInput(
              msg('phone'), msg('phonePlaceholder'), 'phone', true,
              [{
                validator: (rule, value, callback) => validatePhone(value, callback,
                  (msgs, descriptor) => format(msgs)(intl, descriptor))
              }],
              { initialValue: phone }
            )}
            {this.renderTextInput(
              'Email', msg('emailPlaceholder'), 'email', false,
              [{ type: 'email', message: formatContainerMsg(intl, 'emailError') }],
              { initialValue: email }
            )}
            {
              this.renderTextInput(
                msg('position'), '', 'position', false, undefined,
                { initialValue: position }
              )
            }
            {this.props.formData.role !== TENANT_ROLE.owner.name &&
            <FormItem label={msg('isAdmin')} labelCol={{span: 6}} wrapperCol={{span: 18}}>
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                { ...getFieldProps(
                  'adminChecked', {
                    valuePropName: 'checked',
                    initialValue: this.props.formData.role === TENANT_ROLE.manager.name,
                    onChange: this.handleAdminCheck,
                  })
                }
              />
            </FormItem>}
            <Row>
              <Col span="18" offset="6">
                <Button disabled={ disableSubmit } htmlType="submit" type="primary" loading={submitting}
                  title={ disableSubmit ? msg('nonTenantEdit') : '' }
                >
                {formatGlobalMsg(intl, 'ok')}
                </Button>
                <Button onClick={ this.handleCancel } disabled={submitting}>
                {formatGlobalMsg(intl, 'cancel')}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>);
  }
}
