import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form, Input, Select, message, Modal } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { assignForm, clearForm, edit, submit, loadRoles, toggleUserModal } from 'common/reducers/personnel';
import { isLoginNameExist, checkLoginName } from 'common/reducers/checker-reducer';
import { validatePhone } from 'common/validater';
import { PRESET_TENANT_ROLE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

function fetchData({
  state, dispatch,
}) {
  dispatch(loadRoles(state.account.tenantId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    selectedIndex: state.personnel.selectedIndex,
    formData: state.personnel.formData,
    submitting: state.personnel.submitting,
    code: state.account.code,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    roles: state.personnel.roles, // .filter(rol => rol.name !== PRESET_TENANT_ROLE.owner.name),
    visible: state.personnel.userModal.visible,
    pid: state.personnel.userModal.pid,
    personnel: state.personnel,
  }),
  {
    edit, submit, checkLoginName, toggleUserModal, loadRoles, assignForm, clearForm,
  }
)
@withPrivilege({
  module: 'corp',
  feature: 'personnel',
  action: props => (props.formData.key === null ? 'create' : 'edit'),
})
@Form.create()
export default class CorpEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    roles: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    code: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    parentTenantId: PropTypes.number.isRequired,
    form: PropTypes.shape({
      getFieldDecorator: PropTypes.func,
    }).isRequired,
    formData: PropTypes.shape({
      name: PropTypes.string,
      username: PropTypes.string,
      password: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
      position: PropTypes.string,
    }).isRequired,
    submitting: PropTypes.bool.isRequired,
    edit: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    checkLoginName: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    role: '',
  }
  componentDidMount() {
    this.props.form.resetFields();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      const { pid } = nextProps;
      if (pid) {
        this.props.assignForm(this.props.personnel, pid);
      } else {
        this.props.clearForm();
      }
    }
  }
  onSubmitReturn(error) { // eslint-disable-line
    if (error) {
      message.error(error.message, 10);
    }
  }
  msg = formatMsg(this.props.intl)
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
        if (this.props.pid) {
          this.props.edit(form, this.props.code, this.props.tenantId).then((result) => {
            if (!result.error) {
              this.handleCancel(false);
              this.props.reload();
            } else {
              this.onSubmitReturn(result.error);
            }
          });
        } else {
          this.props.submit(
            form,
            this.props.code,
            this.props.tenantId,
            this.props.parentTenantId
          ).then((result) => {
            if (!result.error) {
              this.handleCancel(false);
              this.props.reload();
            } else {
              this.onSubmitReturn(result.error);
            }
          });
        }
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel = () => {
    this.props.toggleUserModal(false);
    this.props.form.resetFields();
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps, type = 'text') {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <FormItem
        label={labelName}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        hasFeedback
        required={required}
      >
        {getFieldDecorator(field, {
          rules, ...fieldProps,
        })(<Input type={type} placeholder={placeholder} />)}
      </FormItem>
    );
  }
  render() {
    const {
      formData: {
        name, username, phone, email, position,
      },
      intl, form: { getFieldDecorator, getFieldValue }, code, roles, visible,
    } = this.props;
    const isCreating = !this.props.pid && this.props.pid !== 0;
    const msg = descriptor => formatMsg(intl, descriptor);
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal onOk={this.handleSubmit} maskClosable={false} visible={visible} title={this.props.pid ? '编辑用户' : '添加用户'} onCancel={this.handleCancel}>
        <Form layout="horizontal">
          <FormItem
            label={this.msg('fullName')}
            {...formItemLayout}
            hasFeedback
            required
          >
            {getFieldDecorator('name', {
              rules: [{ required: true, min: 2, message: this.msg('fullNameMessage') }],
              initialValue: name,
            })(<Input placeholder={this.msg('fullNamePlaceholder')} />)}
          </FormItem>
          <FormItem
            label={this.msg('username')}
            {...formItemLayout}
            required
          >
            {getFieldDecorator('username', {
                rules: [{
                  validator: (rule, value, callback) => isLoginNameExist(
                    getFieldValue('username'), code, this.props.formData.login_id,
                      this.props.tenantId, callback, message, this.props.checkLoginName,
                      (msgs, descriptor) => format(msgs)(intl, descriptor)
                    ),
                }],
                initialValue: username && username.split('@')[0],
              })(<Input addonAfter={`@${code}`} />)}
          </FormItem>
          {
              isCreating && this.renderTextInput(
                this.msg('password'), this.msg('passwordPlaceholder'), 'password', true,
                [{ required: true, min: 6, message: msg('passwordMessage') }],
                { initialValue: '' }, 'password'
              )
            }
          {this.renderTextInput(
              this.msg('phone'), this.msg('phonePlaceholder'), 'phone', false,
              [{
                validator: (rule, value, callback) =>
                validatePhone(value, callback, (msgs, descriptor) =>
                format(msgs)(intl, descriptor)),
              }],
              { initialValue: phone }
            )}
          {this.renderTextInput(
              'Email', this.msg('emailPlaceholder'), 'email', false,
              [{ type: 'email', message: this.msg('emailError') }],
              { initialValue: email }
            )}
          {
              this.renderTextInput(
                this.msg('position'), '', 'position', false, undefined,
                { initialValue: position }
              )
            }
          {this.props.formData.role !== PRESET_TENANT_ROLE.owner.name &&
          <FormItem label={this.msg('role')} {...formItemLayout}>
            {getFieldDecorator('role_id', {
                  initialValue: this.props.formData.role_id,
                  rules: [{ required: true, message: ' ', type: 'number' }],
                })(<Select onSelect={this.handleRoleSelect}>
                  {
                roles.filter(rol => rol.name !== PRESET_TENANT_ROLE.owner.name).map(role =>
                  <Option value={role.id} key={role.id}>{role.name}</Option>)
              }
                </Select>)}
          </FormItem>}
        </Form>
      </Modal>);
  }
}
