import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Input, Select, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadOrganizationForm, clearForm, editOrganization, submit } from
  'common/reducers/corps';
import { isLoginNameExist, checkLoginName } from
  'common/reducers/checker-reducer';
import { validatePhone } from 'common/validater';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);
const formatGlobalMsg = format(globalMessages);
const FormItem = Form.Item;
const Option = Select.Option;

function fetchData({ dispatch, cookie, params }) {
  const corpId = parseInt(params.id, 10);
  if (corpId) {
    return dispatch(loadOrganizationForm(cookie, corpId));
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
    formData: state.corps.formData,
    corpUsers: state.corps.corpUsers,
    submitting: state.corps.submitting,
    account: state.account,
  }),
  { editOrganization, submit, checkLoginName }
)
@withPrivilege({
  module: 'corp',
  feature: 'organization',
  action: props => props.formData.key === null ? 'create' : 'edit',
})
@Form.create()
export default class CorpEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    account: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    corpUsers: PropTypes.array.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    editOrganization: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    checkLoginName: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }
  onSubmitReturn(error) {
    if (error) {
      message.error(error.message, 10);
    } else {
      goBack(this.context.router);
    }
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const form = {
          ...this.props.formData,
          ...this.props.form.getFieldsValue(),
        };
        if (this.props.formData.key) {
          // only with poid coid(owner id) and organization name
          this.props.editOrganization(form).then((result) => {
            this.onSubmitReturn(result.error);
          });
        } else {
          const {
            account: {
              tenantId, aspect, code, subdomain, category_id,
            },
          } = this.props;
          const tenant = {
            tenantId,
            aspect,
            code,
            category_id,
            subdomain,
          };
          this.props.submit(form, tenant).then((result) => {
            this.onSubmitReturn(result.error);
          });
        }
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel = () => {
    goBack(this.context.router);
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <FormItem label={labelName} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
        hasFeedback required={required}
      >
        {getFieldDecorator(field, { rules, ...fieldProps })(<Input type="text" placeholder={placeholder} />)}
      </FormItem>
    );
  }
  renderOwnerForm() {
    const {
      form: { getFieldDecorator }, intl,
      formData: {
        contact, loginName, phone, email,
      }, account: { code, tenantId },
    } = this.props;
    return (
      <div>
        {this.renderTextInput(
          formatMsg(intl, 'chief'), formatMsg(intl, 'chiefPlaceholder'), 'contact',
          true, [{ required: true, min: 2, message: formatMsg(intl, 'nameMessage') }],
          { initialValue: contact }
        )}
        <FormItem label={formatMsg(intl, 'username')} labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }} hasFeedback required
        >
          {getFieldDecorator('loginName', {
            rules: [{
              validator: (rule, value, callback) => isLoginNameExist(
                value, code, this.props.formData.loginId,
                tenantId, callback, message,
                this.props.checkLoginName,
                (msgs, descriptor) => format(msgs)(intl, descriptor)
              ),
            }],
            initialValue: loginName,
          })(<Input type="text" addonAfter={`@${code}`} />)}
        </FormItem>
        {this.renderTextInput(formatMsg(intl, 'phone'), '', 'phone', true, [{
          validator: (rule, value, callback) => validatePhone(
            value, callback,
            (msgs, descriptor) => format(msgs)(intl, descriptor)
          ),
        }], { initialValue: phone })}
        {this.renderTextInput(
'Email', '', 'email', false, [{
          type: 'email',
          message: formatContainerMsg(intl, 'emailError'),
}],
          { initialValue: email }
)}
      </div>
    );
  }
  renderOwnerSelect() {
    const { corpUsers, intl, form: { getFieldDecorator } } = this.props;
    return (
      <FormItem label={formatMsg(intl, 'chief')} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
        required
      >
        {getFieldDecorator('coid', {
            rules: [{ required: true, message: formatMsg(intl, 'chiefRequired') }],
            initialValue: this.props.formData.coid,
          })(<Select style={{ width: '100%' }}>
            {
            corpUsers.map(u => <Option value={`${u.id}`} key={`coid${u.id}`}>{u.name}</Option>)
          }
          </Select>)}
      </FormItem>);
  }
  render() {
    const isCreating = this.props.formData.key === null;
    const { formData: { name, subCode }, intl, submitting } = this.props;
    return (
      <div className="page-body">
        <Form layout="horizontal" onSubmit={this.handleSubmit}
          className="form-edit-content offset-right-col"
        >
          {
            this.renderTextInput(
              formatMsg(intl, 'organName'), formatMsg(intl, 'organPlaceholder'), 'name', true,
              [{ required: true, min: 2, message: formatMsg(intl, 'nameMessage') }],
              { initialValue: name }
            )
          }
          {
            this.renderTextInput(
              formatMsg(intl, 'organSubcode'), formatMsg(intl, 'organSubcodePlaceholder'),
              'subCode', true,
              [{ required: true, max: 20, message: formatMsg(intl, 'subcodeMessage') }],
              { initialValue: subCode }
            )
          }
          {
            isCreating ? this.renderOwnerForm() : this.renderOwnerSelect()
          }
          <Row>
            <Col span="18" offset="6">
              <Button htmlType="submit" type="primary" loading={submitting}>{formatGlobalMsg(intl, 'ok')}</Button>
              <Button onClick={this.handleCancel} disabled={submitting}>{formatGlobalMsg(intl, 'cancel')}</Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
