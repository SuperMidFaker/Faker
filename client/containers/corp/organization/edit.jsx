import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Input, Select, Row, Col, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { loadOrganizationForm, clearForm, setFormValue, editOrganization, submit } from
  '../../../../universal/redux/reducers/corps';
import { isLoginNameExist, checkLoginName } from
  '../../../../reusable/domains/redux/checker-reducer';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import { validatePhone } from '../../../../reusable/common/validater';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
import containerMessages from 'client/containers/message.i18n';
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
    account: state.account
  }),
  { setFormValue, editOrganization, submit, checkLoginName })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle === 'componentDidMount') {
    return;
  }
  const isCreating = props.formData.key === null;
  dispatch(setNavTitle({
    depth: 3,
    text: isCreating ? formatMsg(props.intl, 'editTitle') : props.formData.name,
    moduleName: 'corp',
    goBackFn: () => goBack(router),
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
    account: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    corpUsers: PropTypes.array.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    editOrganization: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    checkLoginName: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
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
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        if (this.props.formData.key) {
          // only with poid coid(owner id) and organization name
          this.props.editOrganization(this.props.formData).then(result => {
            this.onSubmitReturn(result.error);
          });
        } else {
          const { account: { tenantId, aspect, code, subdomain, category_id }} = this.props;
          const tenant = {
            tenantId,
            aspect,
            code,
            category_id,
            subdomain,
          };
          this.props.submit(this.props.formData, tenant).then(result => {
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
    const { formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  renderOwnerForm() {
    const { formhoc: { getFieldProps, getFieldError }, intl, account: { code, tenantId }} = this.props;
    return (
      <div>
        {this.renderTextInput(
          formatMsg(intl, 'chief'), formatMsg(intl, 'chiefPlaceholder'), 'contact',
          true, [{required: true, min: 2, message: formatMsg(intl, 'nameMessage')}]
        )}
        <FormItem label={formatMsg(intl, 'username')} labelCol={{span: 6}}
          wrapperCol={{span: 18}} hasFeedback required
          help={getFieldError('loginName')}
        >
          <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
            rules: [{
              validator: (rule, value, callback) => isLoginNameExist(
                value, code, this.props.formData.loginId,
                tenantId, callback, message,
                this.props.checkLoginName,
                (msgs, descriptor) => format(msgs)(intl, descriptor)
              )
            }]
          })} />
        </FormItem>
        {this.renderTextInput(formatMsg(intl, 'phone'), '', 'phone', true, [{
          validator: (rule, value, callback) => validatePhone(
            value, callback,
            (msgs, descriptor) => format(msgs)(intl, descriptor)
          )
        }])}
        {this.renderTextInput('Email', '', 'email', false, [{
          type: 'email',
          message: formatContainerMsg(intl, 'emailError')}])}
      </div>);
  }
  renderOwnerSelect() {
    const { corpUsers, intl, formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={formatMsg(intl, 'chief')} labelCol={{span: 6}} wrapperCol={{span: 18}}
        help={getFieldError('coid')} required>
        <Select style={{ width: '100%' }} { ...getFieldProps(
          'coid', {
            rules: [{required: true, message: formatMsg(intl, 'chiefRequired')}]
          }) }
        >
          {
            corpUsers.map(u => <Option value={`${u.id}`} key={`coid${u.id}`}>{ u.name }</Option>)
          }
        </Select>
      </FormItem>);
  }
  render() {
    const isCreating = this.props.formData.key === null;
    const { intl, submitting } = this.props;
    return (
      <div className="page-body">
        <Form horizontal onSubmit={this.handleSubmit} form={this.props.formhoc}
          className="form-edit-content offset-right-col"
        >
          {
            this.renderTextInput(
              formatMsg(intl, 'organName'), formatMsg(intl, 'organPlaceholder'), 'name', true,
              [{required: true, min: 2, message: formatMsg(intl, 'nameMessage')}]
            )
          }
          {
            this.renderTextInput(
              formatMsg(intl, 'organSubcode'), formatMsg(intl, 'organSubcodePlaceholder'),
              'subCode', true,
              [{required: true, max: 20, message: formatMsg(intl, 'subcodeMessage')}]
            )
          }
          {
            isCreating ? this.renderOwnerForm() : this.renderOwnerSelect()
          }
          <Row>
            <Col span="18" offset="6">
              <Button htmlType="submit" type="primary" loading={submitting}>{formatGlobalMsg(intl, 'ok')}</Button>
              <Button onClick={ this.handleCancel } disabled={submitting}>{formatGlobalMsg(intl, 'cancel')}</Button>
            </Col>
          </Row>
        </Form>
      </div>);
  }
}
