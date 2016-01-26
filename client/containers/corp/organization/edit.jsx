import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { renderValidateStyle } from '../../../../reusable/browser-util/react-ant';
import { Button, Form, Input, Row, Col, message } from '../../../../reusable/ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import connectNav from '../../../../reusable/decorators/connect-nav';
import { isFormDataLoaded, loadForm, assignForm, clearForm, setFormValue, edit,
  submit, checkLoginName } from '../../../../universal/redux/reducers/corps';
import { setNavTitle } from '../../../../universal/redux/reducers/navbar';
import {isMobile} from '../../../../reusable/common/validater';
const FormItem = Form.Item;

function fetchData({state, dispatch, cookie, params}) {
  const corpId = parseInt(params.id, 10);
  if (corpId) {
    if (!isFormDataLoaded(state.corps, corpId)) {
      return dispatch(loadForm(cookie, corpId));
    } else {
      return dispatch(assignForm(state.corps, corpId));
    }
  } else {
    return dispatch(clearForm());
  }
}

@connectFetch()(fetchData)
@connect(
  state => ({
    formData: state.corps.formData,
    account: state.account
  }),
  {setFormValue, edit, submit, checkLoginName, setNavTitle})
@connectNav((props) => {
  if (props.formData.key === undefined) {
    return;
  }
  const isCreating = props.formData.key === null;
  props.setNavTitle({
    depth: 3,
    text: isCreating ? '添加部门或分支机构' : props.formData.name,
    moduleName: '',
    goBackFn: () => props.history.goBack(),
    withModuleLayout: false
  });
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
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    checkLoginName: PropTypes.func.isRequired,
    setNavTitle: PropTypes.func.isRequired,
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
    // todo can use common
    if (name === undefined || name === '') {
      return callback(new Error('用户名必填'));
    }
    // 判断主租户用户名是否重复
    this.props.checkLoginName(name || '', this.props.formData.loginId, this.props.account.tenantId).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
        callback();
      } else if (result.data.exist) {
        callback(new Error('用户名已存在'));
      } else {
        callback();
      }
    });
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}} validateStatus={rules
        && renderValidateStyle(field, this.props.formhoc)}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const {formhoc: {getFieldProps, getFieldError}, account: {code}} = this.props;
    return (
      <div className="page-body">
        <Form horizontal onSubmit={(ev) => this.handleSubmit(ev)} className="form-edit-content">
          {this.renderTextInput('名称', '请输入部门或分支机构名称', 'name', true, [{required: true, min: 2, message: '2位以上中英文'}])}
          {this.renderTextInput('负责人', '请输入负责人名称', 'contact', true, [{required: true, min: 2, message: '2位以上中英文'}])}
          <FormItem label="用户名" labelCol={{span: 6}} wrapperCol={{span: 18}} help={getFieldError('loginName')} hasFeedback
            validateStatus={renderValidateStyle('loginName', this.props.formhoc)} required>
            <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
              rules: [{validator: (rule, value, callback) => this.isLoginNameExist(value, callback)}],
              adapt: (value) => value && value.split('@')[0],
              transform: (value) => `${value}@${code}`
            })} />
          </FormItem>
          {this.renderTextInput('手机号', '', 'phone', true, [{
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
          {this.renderTextInput('Email', '', 'email', false, [{
            type: 'string',
            pattern: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
            message: 'email格式错误'}])}
          <Row>
            <Col span="18" offset="6">
              <Button htmlType="submit" type="primary">确定</Button>
              <Button onClick={ () => this.handleCancel() }>取消</Button>
            </Col>
          </Row>
        </Form>
      </div>);
  }
}
