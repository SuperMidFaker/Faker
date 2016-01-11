import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {renderValidateStyle} from '../../../../reusable/browser-util/react-ant';
import {AntIcon, Button, Form, Input, Row, Col, message} from '../../../../reusable/ant-ui';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import {isFormDataLoaded, loadForm, assignForm, setFormValue, edit, submit} from '../../../../universal/redux/reducers/corps';
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
    return dispatch(assignForm(state.corps, null));
  }
}

@connectFetch()(fetchData)
@connect(
  state => ({
    formData: state.corps.formData,
    code: state.account.code
  }),
  {setFormValue, edit, submit})
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
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired
  }
  handleSubmit(ev) {
    function onSubmitReturn(error) {
      if (error) {
        message.error(error.message, 10);
      } else {
        this.props.history.goBack();
      }
    }
    ev.preventDefault();
    this.props.formhoc.validate((errors) => {
      if (!errors) {
        if (this.props.formData.key) {
          this.props.edit(this.props.formData).then((result) => {
            onSubmitReturn(result.error);
          });
        } else {
          this.props.submit(this.props.formData).then((result) => {
            onSubmitReturn(result.error);
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
    callback(null);
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 4}} wrapperCol={{span: 6}} validateStatus={rules
        && renderValidateStyle(field, this.props.formhoc)}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const {formhoc: {getFieldProps, getFieldError}, code} = this.props;
    return (
      <div className="page-body">
        <div className="panel-header">
          <h3>{!this.props.formData.key ? '添加' : '修改'}部门或分支机构</h3>
        </div>
        <Row className="horizontal-divider">
          <Form horizontal onSubmit={(ev) => this.handleSubmit(ev)}>
            {this.renderTextInput('名称', '请输入部门或分支机构名称', 'name', true, [{required: true, min: 2, message: '2位以上中英文'}])}
            {this.renderTextInput('负责人', '请输入负责人名称', 'contact', true, [{required: true, min: 2, message: '2位以上中英文'}])}
            <FormItem label="用户名" labelCol={{span: 4}} wrapperCol={{span: 6}} help={getFieldError('loginName')} hasFeedback
              validateStatus={renderValidateStyle('loginName', this.props.formhoc)} required>
              <Input type="text" addonAfter={`@${code}`} {...getFieldProps('loginName', {
                rules: [{validator: (rule, value, callback) => this.isLoginNameExist(value, callback)}]
              })} />
            </FormItem>
            {this.renderTextInput('手机号', '', 'phone', true, [{
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
            {this.renderTextInput('Email', '', 'email', false, [{
              type: 'string',
              pattern: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
              message: 'email格式错误'}])}
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
