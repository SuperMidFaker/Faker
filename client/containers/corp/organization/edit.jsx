import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Form, Input, Select, Row, Col, message } from 'ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { loadOrganizationForm, clearForm, setFormValue, editOrganization, submit } from
  '../../../../universal/redux/reducers/corps';
import { isLoginNameExist, checkLoginName } from
  '../../../../reusable/domains/redux/checker-reducer';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import { validatePhone } from '../../../../reusable/common/validater';
import Msg from './message.i18n';
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

function goBack(props) {
  props.history.goBack();
}

@connectFetch()(fetchData)
@connect(
  state => ({
    formData: state.corps.formData,
    corpUsers: state.corps.corpUsers,
    account: state.account
  }),
  { setFormValue, editOrganization, submit, checkLoginName })
@connectNav((props, dispatch) => {
  if (props.formData.key === undefined) {
    return;
  }
  const isCreating = props.formData.key === null;
  dispatch(setNavTitle({
    depth: 3,
    // text: isCreating ? '添加部门或分支机构' : props.formData.name,
    text: isCreating ? <Msg s="organization.edit.title" /> : props.formData.name,
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
    history: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    corpUsers: PropTypes.array.isRequired,
    formData: PropTypes.object.isRequired,
    editOrganization: PropTypes.func.isRequired,
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
          // only with poid coid(owner id) and organization name
          this.props.editOrganization(this.props.formData).then(result => {
            this.onSubmitReturn(result.error);
          });
        } else {
          this.props.submit(this.props.formData, this.props.account).then(result => {
            this.onSubmitReturn(result.error);
          });
        }
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel = () => {
    goBack(this.props);
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
    const { formhoc: {getFieldProps, getFieldError}, account: {code} } = this.props;
    return (
      <div>
        {this.renderTextInput('负责人', '请输入负责人名称', 'contact', true, [{required: true, min: 2, message: '2位以上中英文'}])}
        <FormItem label="用户名" labelCol={{span: 6}} wrapperCol={{span: 18}} hasFeedback required
          help={getFieldError('loginName')}>
          <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
            rules: [{
              validator: (rule, value, callback) =>
              isLoginNameExist(value, code, this.props.formData.loginId,
                               this.props.account.tenantId, callback,
                               message, this.props.checkLoginName)
            }]
          })} />
        </FormItem>
        {this.renderTextInput('手机号', '', 'phone', true, [{
          validator: (rule, value, callback) => validatePhone(value, callback)
        }])}
        {this.renderTextInput('Email', '', 'email', false, [{
          type: 'email',
          message: 'email格式错误'}])}
      </div>);
  }
  renderOwnerSelect() {
    const { corpUsers, formhoc: { getFieldProps, getFieldError } } = this.props;
    return (
      <FormItem label="负责人" labelCol={{span: 6}} wrapperCol={{span: 18}}
        help={getFieldError('coid')} required>
        <Select style={{ width: '100%' }} { ...getFieldProps('coid', {
          rules: [{required: true, message: '负责人必填'}]}) }>
          {
            corpUsers.map(u => <Option value={`${u.id}`} key={`coid${u.id}`}>{ u.name }</Option>)
          }
        </Select>
      </FormItem>);
  }
  render() {
    const isCreating = this.props.formData.key === null;
    return (
      <div className="page-body">
        <Form horizontal onSubmit={this.handleSubmit} form={ this.props.formhoc }
        className="form-edit-content offset-right-col">
          {this.renderTextInput('名称', '请输入部门或分支机构名称', 'name', true, [{required: true, min: 2, message: '2位以上中英文'}])}
          {
            isCreating ? this.renderOwnerForm() : this.renderOwnerSelect()
          }
          <Row>
            <Col span="18" offset="6">
              <Button htmlType="submit" type="primary">确定</Button>
              <Button onClick={ this.handleCancel }>取消</Button>
            </Col>
          </Row>
        </Form>
      </div>);
  }
}
