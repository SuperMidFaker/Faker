import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { renderValidateStyle } from '../../../../reusable/browser-util/react-ant';
import { AntIcon as Icon, Button, Form, Input, Row, Col, Switch, message } from
'../../../../reusable/ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { isFormDataLoaded, loadForm, assignForm, clearForm, setFormValue, edit, submit } from
'../../../../universal/redux/reducers/personnel';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import { isLoginNameExist, checkLoginName } from
'../../../../reusable/domains/redux/checker-reducer';
import { isMobile } from '../../../../reusable/common/validater';
import { TENANT_ROLE } from '../../../../universal/constants';
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

@connectFetch()(fetchData)
@connect(
  state => ({
    formData: state.personnel.formData,
    code: state.account.code,
    tenant: state.personnel.tenant
  }),
  { setFormValue, edit, submit, checkLoginName, setNavTitle })
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
    code: PropTypes.string.isRequired,
    tenant: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    setNavTitle: PropTypes.func.isRequired,
    checkLoginName: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired
  }
  componentWillMount() {
    const isCreating = this.props.formData.key === null;
    this.props.setNavTitle({
      depth: 3,
      text: isCreating ? '添加用户' : `用户${this.props.formData.name}`,
      moduleName: '',
      withModuleLayout: false,
      backUrl: '/corp/personnel'
    });
  }
  componentWillReceiveProps(nextProps) {
    const isCreating = nextProps.formData.key === null;
    this.props.setNavTitle({
      depth: 3,
      text: isCreating ? '添加用户' : `用户${nextProps.formData.name}`,
      moduleName: '',
      withModuleLayout: false,
      backUrl: '/corp/personnel'
    });
  }
  onSubmitReturn(error) {
    if (error) {
      message.error(error.message, 10);
    } else {
      this.props.history.goBack();
    }
  }
  handleSubmit(ev) {
    ev.preventDefault();
    this.props.formhoc.validate((errors) => {
      if (!errors) {
        if (this.props.formData.key) {
          this.props.edit(this.props.formData).then(result => {
            this.onSubmitReturn(result.error);
          });
        } else {
          this.props.submit(this.props.formData, this.props.tenant).then(result => {
            this.onSubmitReturn(result.error);
          });
        }
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel() {
    this.props.history.goBack();
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps, type = 'text') {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}} validateStatus={rules
        && renderValidateStyle(field, this.props.formhoc)}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type={type} placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const {formhoc: {getFieldProps, getFieldError}, code} = this.props;
    const isCreating = this.props.formData.key === null;
    // todo loginname no '@'
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>用户管理</h2>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <h3>{isCreating ? '添加' : '修改'}用户</h3>
          </div>
          <div className="panel-body">
            <Form horizontal onSubmit={(ev) => this.handleSubmit(ev)} className="form-edit-content">
              {this.renderTextInput('姓名', '请输入真实姓名', 'name', true, [{required: true, min: 2, message: '2位以上中英文'}])}
              <FormItem label="用户名" labelCol={{span: 6}} wrapperCol={{span: 18}} help={getFieldError('loginName')} hasFeedback
                validateStatus={renderValidateStyle('loginName', this.props.formhoc)} required>
                <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
                  rules: [{validator: (rule, value, callback) => isLoginNameExist(value, this.props.formData.loginId,
                                                                                  this.props.tenant.id, callback,
                                                                                 message, this.props.checkLoginName)}],
                  adapt: (value) => value && value.split('@')[0],
                  transform: (value) => `${value}@${code}`
                })} />
              </FormItem>
              {isCreating && this.renderTextInput('登录密码', '首次登录时会提示更改密码', 'password',
                                                  true, [{required: true, min: 6, message: '至少6位字符'}],
                                                 null, 'password')}
              {this.renderTextInput('手机号', '可作登录帐号使用', 'phone', true, [{
                validator: (rule, value, callback) => {
                  if (value === undefined || value === '') {
                    callback(new Error('联系人手机号必填'));
                  } else if (isMobile(value)) {
                    callback();
                  } else {
                    callback(new Error('非法手机号'));
                  }
                }}
              ])}
              {this.renderTextInput('Email', '绑定后可作登录帐号使用', 'email', false, [{
                type: 'string',
                pattern: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
                message: 'email格式错误'}])}
              {this.renderTextInput('职位', '', 'position')}
              {this.props.formData.role !== TENANT_ROLE.owner.name &&
              <FormItem label="是否管理员" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                  onChange={(checked) => this.props.setFormValue('role',
                                        checked ? TENANT_ROLE.manager.name : TENANT_ROLE.member.name)}
                  checked={this.props.formData.role && this.props.formData.role === TENANT_ROLE.manager.name}/>
              </FormItem>}
              <Row>
                <Col span="18" offset="6">
                  <Button htmlType="submit" type="primary">确定</Button>
                  <Button onClick={ () => this.handleCancel() }>取消</Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>);
  }
}
