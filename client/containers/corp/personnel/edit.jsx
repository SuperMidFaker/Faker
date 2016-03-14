import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Form, Input, Row, Col, Switch, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { isFormDataLoaded, loadForm, assignForm, clearForm, setFormValue, edit, submit } from
'../../../../universal/redux/reducers/personnel';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import { isLoginNameExist, checkLoginName } from
'../../../../reusable/domains/redux/checker-reducer';
import { validatePhone } from '../../../../reusable/common/validater';
import { TENANT_ROLE } from '../../../../universal/constants';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
import containerMessages from 'client/containers/message.i18n';
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

function goBack(props) {
  props.history.goBack();
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    selectedIndex: state.personnel.selectedIndex,
    formData: state.personnel.formData,
    code: state.account.code,
    tenant: state.personnel.tenant
  }),
  { setFormValue, edit, submit, checkLoginName })
@connectNav((props, dispatch, lifecycle) => {
  if (lifecycle === 'componentDidMount') {
    return;
  }
  const isCreating = props.formData.key === null;
  dispatch(setNavTitle({
    depth: 3,
    text: isCreating ? formatMsg(props.intl, 'newUser') :
      `${formatMsg(props.intl, 'user')}${props.formData.name}`,
    moduleName: 'corp',
    goBackFn: () => goBack(props),
    withModuleLayout: false
  }));
})
@Form.formify({
  mapPropsToFields(props) {
    return props.formData;
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      props.setFormValue(name, fields[name].value);
    }
  },
  formPropName: 'formhoc'
})
export default class CorpEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    history: PropTypes.object.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    tenant: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    checkLoginName: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired
  }
  onSubmitReturn(error) {
    if (error) {
      message.error(error.message, 10);
    } else {
      goBack(this.props);
    }
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        if (this.props.formData.key) {
          this.props.edit(this.props.formData, this.props.code, this.props.tenant.id).then(
            result => this.onSubmitReturn(result.error)
          );
        } else {
          this.props.submit(this.props.formData, this.props.code, this.props.tenant).then(
            result => this.onSubmitReturn(result.error)
          );
        }
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel = () => {
    goBack(this.props);
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps, type = 'text') {
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
    // todo loginname no '@'
    return (
      <div className="main-content">
        <div className="page-body">
          <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc}
          className="form-edit-content offset-right-col">
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
              })} />
            </FormItem>
            {
              isCreating && this.renderTextInput(
                msg('password'), msg('passwordPlaceholder'), 'password', true,
                [{required: true, min: 6, message: msg('passwordMessage')}],
                null, 'password')
            }
            {this.renderTextInput(
              msg('phone'), msg('phonePlaceholder'), 'phone', true,
              [{ validator: (rule, value, callback) => validatePhone(value, callback,
                  (msgs, descriptor) => format(msgs)(intl, descriptor)) }]
            )}
            {this.renderTextInput(
              'Email', msg('emailPlaceholder'), 'email', false,
              [{ type: 'email', message: formatContainerMsg(intl, 'emailError') }]
            )}
            {this.renderTextInput(msg('position'), '', 'position')}
            {this.props.formData.role !== TENANT_ROLE.owner.name &&
            <FormItem label={msg('isAdmin')} labelCol={{span: 6}} wrapperCol={{span: 18}}>
              <Switch checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
                onChange={checked =>
                  this.props.setFormValue(
                    'role', checked ? TENANT_ROLE.manager.name : TENANT_ROLE.member.name)}
                checked={this.props.formData.role
                  && this.props.formData.role === TENANT_ROLE.manager.name}
              />
            </FormItem>}
            <Row>
              <Col span="18" offset="6">
                <Button disabled={ disableSubmit } htmlType="submit" type="primary"
                title={ disableSubmit ? msg('nonTenantEdit') : '' }>{formatGlobalMsg(intl, 'ok')}</Button>
                <Button onClick={ this.handleCancel }>{formatGlobalMsg(intl, 'cancel')}</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>);
  }
}
