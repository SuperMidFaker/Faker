import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {renderValidateStyle} from '../../../../reusable/browser-util/react-ant';
import {AntIcon as Icon, Button, Form, Input, Row, Col, Switch, message} from '../../../../reusable/ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import {isFormDataLoaded, loadForm, assignForm, clearForm, setFormValue, edit, submit} from '../../../../universal/redux/reducers/personnel';
import {isLoginNameExist, checkLoginName} from '../../../../reusable/domains/redux/checker-reducer';
import {isMobile} from '../../../../reusable/common/validater';
import {TENANT_ROLE} from '../../../../universal/constants';
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
    account: state.account
  }),
  {setFormValue, edit, submit, checkLoginName})
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
          this.props.submit(this.props.formData, this.props.account).then(result => {
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
  isLoginNameExist(name, callback) {
    if (name === undefined || name === '') {
      return callback(new Error('用户名必填'));
    }
    // 判断主租户下用户名是否重复
    this.props.checkLoginName(name || '', this.props.formData.loginId, this.props.account.tenantId).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
        callback(null);
      } else if (result.data.exist) {
        callback(new Error('用户名已存在'));
      } else {
        callback(null);
      }
    });
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps, type = 'text') {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 4}} wrapperCol={{span: 6}} validateStatus={rules
        && renderValidateStyle(field, this.props.formhoc)}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type={type} placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const {formhoc: {getFieldProps, getFieldError}, account: {code}} = this.props;
    const isCreating = !this.props.formData.key;
    return (
      <div className="page-body">
        <div className="panel-header">
          <h3>{isCreating ? '添加' : '修改'}用户</h3>
        </div>
        <Row className="horizontal-divider">
          <Form horizontal onSubmit={(ev) => this.handleSubmit(ev)}>
            {this.renderTextInput('姓名', '请输入真实姓名', 'name', true, [{required: true, min: 2, message: '2位以上中英文'}])}
            <FormItem label="用户名" labelCol={{span: 4}} wrapperCol={{span: 6}} help={getFieldError('loginName')} hasFeedback
              validateStatus={renderValidateStyle('loginName', this.props.formhoc)} required>
              <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
                rules: [{validator: (rule, value, callback) => isLoginNameExist(value, this.props.formData.loginId,
                                                                                this.props.account.tenantId, callback,
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
                } else if (isMobile(value) ) {
                  callback(null);
                } else {
                  callback(new Error('非法手机号'));
                }
              }}
            ])}
            {this.renderTextInput('Email', '绑定后可作登录帐号使用', 'email', false, [{
              type: 'string',
              pattern: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
              message: 'email格式错误'}])}
            {this.props.formData.role !== TENANT_ROLE.owner.name &&
            <FormItem label="管理员" labelCol={{span: 4}} wrapperCol={{span: 2}}>
              <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />}
                onChange={(checked) => this.props.setFormValue('role',
                                      checked ? TENANT_ROLE.manager.name : TENANT_ROLE.member.name)}/>
            </FormItem>}
            <Row>
              <Col span="2" offset="4">
                <Button size="large" htmlType="submit" type="primary">确定</Button>
              </Col>
              <Col span="2">
                <Button onClick={ () => this.handleCancel() }>返回</Button>
              </Col>
            </Row>
          </Form>
        </Row>
      </div>);
  }
}
