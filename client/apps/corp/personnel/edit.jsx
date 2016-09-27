import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Input, Row, Col, Select, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { isFormDataLoaded, loadForm, assignForm, clearForm, edit, submit, loadRoles } from
'common/reducers/personnel';
import { isLoginNameExist, checkLoginName } from 'common/reducers/checker-reducer';
import { validatePhone } from 'common/validater';
import { PRESET_TENANT_ROLE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);
const FormItem = Form.Item;
const Option = Select.Option;

function fetchData({ state, dispatch, cookie, params }) {
  const pid = parseInt(params.id, 10);
  dispatch(loadRoles(state.account.tenantId));
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
    roles: state.personnel.roles, // .filter(rol => rol.name !== PRESET_TENANT_ROLE.owner.name),
  }),
  { edit, submit, checkLoginName })
@connectNav({
  depth: 3,
  text: (props) => {
    return props.formData.key === null ?
    formatMsg(props.intl, 'newUser') : props.formData.name;
  },
  moduleName: 'corp',
  lifecycle: 'componentWillReceiveProps',
})
@withPrivilege({
  module: 'corp', feature: 'personnel',
  action: (props) => {
    return props.formData.key === null ? 'create' : 'edit';
  },
})
@Form.create()
export default class CorpEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    roles: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    code: PropTypes.string.isRequired,
    tenant: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    edit: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    checkLoginName: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
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
  handleRoleSelect = (value) => {
    const role = this.props.roles.filter(rl => rl.id === value)[0];
    this.setState({
      role: role.name,
    });
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const form = {
          ...this.props.formData,
          ...this.props.form.getFieldsValue(),
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
    const { form: { getFieldProps } } = this.props;
    return (
      <FormItem label={labelName} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
        hasFeedback required={required}
      >
        <Input type={type} placeholder={placeholder} {...getFieldProps(field, { rules, ...fieldProps })} />
      </FormItem>
    );
  }
  render() {
    const {
      formData: { name, loginName, password, phone, email, position },
      submitting, intl, form: { getFieldProps }, code, roles,
    } = this.props;
    const isCreating = this.props.formData.key === null;
    const disableSubmit = this.props.tenant.id === -1;
    const msg = descriptor => formatMsg(intl, descriptor);
    return (
      <div className="main-content">
        <div className="page-body">
          <Form horizontal onSubmit={this.handleSubmit}
            className="form-edit-content offset-right-col"
          >
            {this.renderTextInput(
              msg('fullName'), msg('fullNamePlaceholder'), 'name', true,
              [{ required: true, min: 2, message: msg('fullNameMessage') }],
              { initialValue: name }
            )}
            <FormItem label={msg('username')} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
              required
            >
              <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
                rules: [{
                  validator: (rule, value, callback) => isLoginNameExist(
                    value, code, this.props.formData.loginId,
                    this.props.tenant.id, callback, message, this.props.checkLoginName,
                    (msgs, descriptor) => format(msgs)(intl, descriptor)),
                }],
                initialValue: loginName,
              })} />
            </FormItem>
            {
              isCreating && this.renderTextInput(
                msg('password'), msg('passwordPlaceholder'), 'password', true,
                [{ required: true, min: 6, message: msg('passwordMessage') }],
                { initialValue: password }, 'password')
            }
            {this.renderTextInput(
              msg('phone'), msg('phonePlaceholder'), 'phone', true,
              [{
                validator: (rule, value, callback) => validatePhone(value, callback,
                  (msgs, descriptor) => format(msgs)(intl, descriptor)),
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
            {this.props.formData.role !== PRESET_TENANT_ROLE.owner.name &&
            <FormItem label={msg('role')} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <Select onSelect={this.handleRoleSelect} {...getFieldProps('role_id', {
                initialValue: this.props.formData.role_id,
                rules: [{ required: true, message: ' ', type: 'number' }],
              })}>
              {
                roles.filter(rol => rol.name !== PRESET_TENANT_ROLE.owner.name).map(
                  role => <Option value={role.id} key={role.id}>{role.name}</Option>
                )
              }
              </Select>
            </FormItem>}
            <Row>
              <Col span="18" offset="6">
                <Button disabled={disableSubmit} htmlType="submit" type="primary" loading={submitting}
                  title={disableSubmit ? msg('nonTenantEdit') : ''}
                >
                {formatGlobalMsg(intl, 'ok')}
                </Button>
                <Button onClick={this.handleCancel} disabled={submitting}>
                {formatGlobalMsg(intl, 'cancel')}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>);
  }
}
