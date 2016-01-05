import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import cx from '../../../reusable/browser-util/classname-join';
import {AntIcon, Button, Form, Input, Row, Col, Select, Tabs} from '../../../reusable/ant-ui';
import connectFetch from '../../../reusable/decorators/connect-fetch';
import {isFormDataLoaded, loadForm, setFormValue, uploadPic, submit} from '../../../universal/redux/reducers/corps';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

function fetchData({state, dispatch, cookie}) {
  const corpId = state.account.corpId;
  if (!isFormDataLoaded(state.corps, corpId)) {
    return dispatch(loadForm(cookie, corpId));
  }
}

@connectFetch()(fetchData)
@connect(
  state => ({
    formData: state.corps.formData
  }),
  {uploadPic, setFormValue, submit})
@Form.formify({
  mapPropsToFields(props) {
    console.log(props);
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
export default class CorpInfo extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    uploadPic: PropTypes.func.isRequired
  }
  renderValidateStyle(item) {
    const {isFieldValidating, getFieldError, getFieldsValue} = this.props.formhoc;
    return cx({
      'error': getFieldError(item),
      'validating': isFieldValidating(item),
      'success': getFieldsValue([item])[item] && !getFieldError(item) && !isFieldValidating(item)
    });
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 16}} validateStatus={rules && this.renderValidateStyle(field)}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  renderBasicForm() {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <Form horizontal>
        <Row>
          <Col span="8">
            {this.renderTextInput('企业名称', '请与营业执照名称一致', 'name', true, [{required: true, message: '公司名称必填'}])}
            {this.renderTextInput('企业简称', '', 'short_name')}
            <FormItem label="所在地" labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Select defaultValue="cn" style={{width:250}} {...getFieldProps('country')}>
                <OptGroup label="选择国家或地区">
                  <Option value="cn">中国</Option>
                </OptGroup>
              </Select>
              <Select style={{width:80}} {...getFieldProps('province')}>
                <Option value="zj">Zhejiang</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="8">
            <FormItem label="行业类型" labelCol={{span: 6}} wrapperCol={{span: 12}}>
              <Select defaultValue="lucy" {...getFieldProps('type')}>
                <Option value="freight">货代</Option>
              </Select>
            </FormItem>
            <FormItem label="企业代码" labelCol={{span: 6}} wrapperCol={{span: 12}}>
              <Input type="text" addonAfter=".welogix.cn" {...getFieldProps('code')} />
            </FormItem>
          </Col>
        </Row>
      </Form>);
  }
  renderFinancialForm() {
    return 'Financial';
  }
  render() {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>企业信息</h2>
        </div>
        <div className="page-body">
          <Tabs defaultActiveKey="tab1">
            <TabPane tab="基础信息" key="tab1">{this.renderBasicForm()}</TabPane>
            <TabPane tab="财务信息" key="tab2">{this.renderFinancialForm()}</TabPane>
          </Tabs>
        </div>
        <div className="bottom-fixed-row">
          <Row>
            <Col span="2" offset="1">
              <Button size="large" type="primary" htmlType="submit" onClick={ () => this.handleSubmit() }>确定</Button>
            </Col>
            <Col span="2">
              <Button onClick={ () => this.handleCancel() }>返回</Button>
            </Col>
          </Row>
        </div>
      </div>);
  }
}
