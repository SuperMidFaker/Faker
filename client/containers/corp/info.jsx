import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import cx from '../../../reusable/browser-util/classname-join';
import {AntIcon, Button, Form, Input, Row, Col, Select, Tabs, message} from '../../../reusable/ant-ui';
import Region from '../../components/region-cascade';
import connectFetch from '../../../reusable/decorators/connect-fetch';
import {isFormDataLoaded, loadForm, setFormValue, uploadImg, edit} from '../../../universal/redux/reducers/corps';
import {isMobile} from '../../../reusable/common/validater';
import {TENANT_LEVEL} from '../../../universal/constants';
const Dropzone = require('react-dropzone');

const Option = Select.Option;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

function fetchData({state, dispatch, cookie}) {
  const corpId = state.account.tenantId;
  if (!isFormDataLoaded(state.corps, corpId)) {
    return dispatch(loadForm(cookie, corpId));
  }
}

@connectFetch()(fetchData)
@connect(
  state => ({
    formData: state.corps.formData
  }),
  {uploadImg, setFormValue, edit})
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
export default class CorpInfo extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    uploadImg: PropTypes.func.isRequired
  }
  handleSubmit() {
    this.props.formhoc.validate((errors, values) => {
      if (!errors) {
        this.props.edit(this.props.formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          }
        });
      } else {
        this.forceUpdate();
      }
    });
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
    const {formData: {country, province, city, district}, formhoc: {getFieldProps}} = this.props;
    return (
      <Form horizontal>
        <Row>
          <Col span="8">
            {this.renderTextInput('企业名称', '请与营业执照名称一致', 'name', true, [{required: true, message: '公司名称必填'}])}
            {this.renderTextInput('企业简称', '', 'short_name', false, [{
              type: 'string', min: 2, pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/, message: '公司简称必须2位以上中英文'}])}
            <FormItem label="所在地" labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Region setFormValue={this.props.setFormValue} region={{
                country, province, city, county: district}} />
            </FormItem>
            {this.renderTextInput('详细地址', '', 'address')}
          </Col>
          <Col span="8">
            <FormItem label="企业代码" labelCol={{span: 6}} wrapperCol={{span: 12}} required>
              <Col span="18">
                <Input type="text" disabled {...getFieldProps('code')} />
              </Col>
              <Col span="6">
                <a role="button"><span>申请修改</span></a>
              </Col>
            </FormItem>
            <FormItem label="行业类型" labelCol={{span: 6}} wrapperCol={{span: 12}}>
              <Select defaultValue="lucy" style={{width:'100%'}} {...getFieldProps('type')}>
                <Option value="freight">货代</Option>
              </Select>
            </FormItem>
            <FormItem label="公司介绍" labelCol={{span: 6}} wrapperCol={{span: 12}}>
              <Input type="textarea" rows="3" {...getFieldProps('remark')} />
            </FormItem>
            <FormItem label="公司网址" labelCol={{span: 6}} wrapperCol={{span: 12}}>
              <Input type="text" addonBefore="http://" {...getFieldProps('website')} />
            </FormItem>
          </Col>
        </Row>
        <Row className="horizontal-divider">
          <Col span="8">
            <Row>
              <Col span="11" offset="3">
              {this.renderTextInput('联系人', '', 'contact', true, [{required: true, message: '联系人名称必填', type: 'string', whitespace: true}]
                                   , {transform: (value) => (value.trim())})}
              </Col>
              <Col span="9">
                <FormItem label="职位" labelCol={{span: 5}} wrapperCol={{span: 16}}>
                  <Input type="text" {...getFieldProps('position')} />
                </FormItem>
              </Col>
            </Row>
            {this.renderTextInput('手机号', '', 'phone', true, [{
              validator: (rule, value, callback) => {
                if (value === '') {
                  callback(new Error('联系人手机号必填'));
                } else if (isMobile(value) ) {
                  callback(null);
                } else {
                  callback(new Error('非法手机号'));
                }
              }}
            ])}
            {this.renderTextInput('Email', '', 'email', false, [{type: 'string', pattern: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,
                                  message: 'email格式错误'}])}
          </Col>
        </Row>
      </Form>);
  }
  renderEnterpriseForm() {
    const {formData: {logo: logoPng}, formhoc: {getFieldProps}} = this.props;
    return (
      <Form>
        <Row>
          <Col span="8">
            <FormItem label="企业LOGO" labelCol={{span: 6}} wrapperCol={{span: 18}}>
              <Col span="5">
                <Dropzone onDrop={ (files) => this.props.uploadImg('logo', files) } style={{}}>
                  <div className="ant-upload ant-upload-drag" title="请拖拽或选择文件来改变" style={{height: 146, width: 186, marginBottom: 20}}>
                    <span>
                      <div className="ant-upload-drag-container">
                        <AntIcon type="plus" />
                      </div>
                    </span>
                  </div>
                </Dropzone>
              </Col>
              <Col span="4" offset="6">
                <img style={{height: 120, width: 120, margin: 10, border: '1px dashed #e0e0e0', borderRadius: 6}} src={logoPng || '/assets/img/wetms.png'}/>
              </Col>
            </FormItem>
          </Col>
        </Row>
        <Row className="horizontal-divider">
          <Col span="8">
            <FormItem label="登录入口域" labelCol={{span: 6}} wrapperCol={{span: 10}}>
            {/* todo validator */}
              <Input type="text" addonAfter=".welogix.cn" {...getFieldProps('subdomain', {rules: [{validator: this.checkCorpDomain}]})} />
            </FormItem>
          </Col>
        </Row>
      </Form>);
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
            <TabPane tab="品牌设置" key="tab2">{this.props.formData.level === TENANT_LEVEL.ENTERPRISE && this.renderEnterpriseForm()}</TabPane>
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
