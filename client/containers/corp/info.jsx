import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { renderValidateStyle } from '../../../reusable/browser-util/react-ant';
import { AntIcon, Button, Form, Input, Row, Col, Select, Tabs, message } from
'../../../reusable/ant-ui';
import Region from '../../components/region-cascade';
import connectFetch from '../../../reusable/decorators/connect-fetch';
import { isFormDataLoaded, loadForm, setFormValue, uploadImg, edit } from
'../../../universal/redux/reducers/corps';
import { checkCorpDomain } from '../../../universal/redux/reducers/corp-domain';
import { validatePhone } from '../../../reusable/common/validater';
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
  {uploadImg, setFormValue, edit, checkCorpDomain})
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
    history: PropTypes.object.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    checkCorpDomain: PropTypes.func.isRequired,
    uploadImg: PropTypes.func.isRequired
  }
  handleSubmit() {
    this.props.formhoc.validate((errors) => {
      if (!errors) {
        this.props.edit(this.props.formData).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('更新成功', 5);
          }
        });
      } else {
        this.forceUpdate();
        message.error('表单检验存在错误', 10);
      }
    });
  }
  handleCancel() {
    this.props.history.goBack();
  }
  isCorpDomainExist(value, callback) {
    this.props.checkCorpDomain(value, this.props.formData.key).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
        callback();
      } else if (result.data.exist) {
        callback(new Error('企业子域名已存在'));
      } else {
        callback();
      }
    });
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 16}} validateStatus={rules
        && renderValidateStyle(field, this.props.formhoc)}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  renderBasicForm() {
    const {formData: {country, province, city, district}, formhoc: {getFieldProps}} = this.props;
    return (
      <div className="body-responsive">
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
            <FormItem label="企业代码" labelCol={{span: 6}} wrapperCol={{span: 18}} required>
              <Col span="18">
                <Input type="text" disabled {...getFieldProps('code')} />
              </Col>
              <Col span="6">
                <p className="ant-form-text">
                  <a role="button">申请修改</a>
                </p>
              </Col>
            </FormItem>
            <FormItem label="行业类型" labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Select defaultValue="lucy" style={{width:'100%'}} {...getFieldProps('type')}>
                <Option value="freight">货代</Option>
              </Select>
            </FormItem>
            <FormItem label="公司介绍" labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Input type="textarea" rows="3" {...getFieldProps('remark')} />
            </FormItem>
            <FormItem label="公司网址" labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Input type="text" addonBefore="http://" {...getFieldProps('website')} />
            </FormItem>
          </Col>
        </Row>
        <Row className="horizontal-divider">
          <Col span="8">
            {this.renderTextInput('联系人', '', 'contact', true, [{required: true, message: '联系人名称必填', type: 'string', whitespace: true}]
                                   , {transform: (value) => (value.trim())})}
            {this.renderTextInput('手机号', '', 'phone', true, [{
              validator: (rule, value, callback) => validatePhone(value, callback)
            }])}
          </Col>
          <Col span="8">
            <FormItem label="职位" labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Input type="text" {...getFieldProps('position')} />
            </FormItem>
            {this.renderTextInput('Email', '', 'email', false, [{type: 'email', message: 'email格式错误'}])}
          </Col>
        </Row>
      </Form>
      </div>);
  }
  renderEnterpriseForm() {
    const {formData: {logo: logoPng}, formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <div className="body-responsive">
      <Form horizontal>
        <Row>
          <Col span="8">
            <FormItem label="企业LOGO" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                <img style={{height: 120, width: 120, margin: 10, border: '1px solid #e0e0e0', borderRadius: 60}} src={logoPng || '/assets/img/wetms.png'}/>
                <Dropzone onDrop={ (files) => this.props.uploadImg('logo', files) } style={{}}>
                  <div className="ant-upload ant-upload-drag" title="请拖拽或选择文件来改变" style={{height: 140, marginTop: 20}}>
                    <span>
                      <div className="ant-upload-drag-container">
                        <AntIcon type="upload" />
                        <p className="ant-upload-hint">建议使用PNG或GIF格式的透明图片</p>
                      </div>
                    </span>
                  </div>
                </Dropzone>
            </FormItem>
          </Col>
        </Row>
        <Row className="horizontal-divider">
          <Col span="8">
            <FormItem label="登录入口域" labelCol={{span: 6}} wrapperCol={{span: 16}} help={getFieldError('subdomain')}>
              <Input type="text" addonAfter=".welogix.cn" disabled {...getFieldProps('subdomain')} />
            </FormItem>
          </Col>
        </Row>
      </Form>
      </div>);
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
          <Button type="primary" size="large" htmlType="submit" onClick={ () => this.handleSubmit() }>确定</Button>
        </div>
      </div>);
  }
}
