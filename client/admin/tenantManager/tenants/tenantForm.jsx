import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Form, Input, Row, Col, message, Checkbox, Radio } from 'ant-ui';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import connectFetch from 'client/common/decorators/connect-fetch';
import { setFormValue, uploadImg, submitTenant, clearForm, loadTenantForm, getTenantAppList } from
  'common/reducers/tenants';
import { checkCorpDomain } from 'common/reducers/corp-domain';
const Dropzone = require('react-dropzone');
import { validatePhone } from 'common/validater';
import './tenant.less';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

function fetchData({ dispatch, cookie, params }) {
  if (params.id) {
    const tenantId = params.id;
    return Promise.all([dispatch(getTenantAppList()), dispatch(loadTenantForm(cookie, tenantId))]);
  } else {
    return Promise.all([dispatch(getTenantAppList()), dispatch(clearForm())]);
  }
}

@connectFetch()(fetchData)
@connect(
  state => ({
    formData: state.tenants.formData,
    tenantAppList: state.tenants.tenantAppList
  }),
  { uploadImg, setFormValue, submitTenant, checkCorpDomain })
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
export default class TenantForm extends React.Component {
  static propTypes = {
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitTenant: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    checkCorpDomain: PropTypes.func.isRequired,
    uploadImg: PropTypes.func.isRequired,
    tenantAppList: PropTypes.array.isRequired,
    router: PropTypes.object.isRequired,
  }
  handleSubmit = () => {
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        this.props.submitTenant(this.props.formData).then(result => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('保存成功', 5);
            this.handleNavigationTo('/manager/tenants');
          }
        });
      } else {
        this.forceUpdate();
        message.error('表单数据填写有误', 10);
      }
    });
  }
  handleNavigationTo(to, query) {
    this.props.router.push({ pathname: to, query });
  }
  handleCancel = () => {
    this.props.router.goBack();
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const { formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 16}}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const { formData: { logo: logoPng }, formhoc: { getFieldProps, getFieldError }, tenantAppList }
      = this.props;
    const tenantAppValueList = this.props.formData.tenantAppValueList || [];
    return (
      <div className="main-content">
        <div className="tenant-form page-body">
          <div className="panel-body body-responsive">
            <Form horizontal form={this.props.formhoc}>
              <Row>
                <Col span="12">
                  {this.renderTextInput(
                    '公司名称', '请填写公司名称', 'name', true,
                    [{required: true, message: '请填写公司名称'}]
                  )}
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="企业代码" labelCol={{span: 6}} wrapperCol={{span: 16}} required>
                    <Input type="text" {...getFieldProps('code')} placeholder="请填写企业代码"/>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  {this.renderTextInput(
                    '联系人', '请填写联系人姓名', 'contact', true, [{
                      required: true,
                      message: '请填写联系人姓名',
                      type: 'string',
                      whitespace: true
                    }], {transform: (value) => (value.trim())}
                  )}
                  {this.renderTextInput('电话', '请填写联系人电话', 'phone', true, [{
                    validator: (rule, value, callback) => validatePhone(
                      value, callback,
                      () => { return '请填写联系人电话';}
                    )
                  }])}
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  {this.renderTextInput(
                    '邮箱', '请填写联系人电子邮箱地址', 'email', false,
                    [{type: 'email', message: '电子邮箱地址填写错误'}]
                  )}
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="LOGO" labelCol={{span: 6}} wrapperCol={{span: 18}} className="imgZone">
                      <img src={logoPng || '/assets/img/wetms.png'} style={{
                        height: 120, width: 120, margin: 10,
                        border: '1px solid #e0e0e0', borderRadius: 60
                      }}
                      {...getFieldProps('logo')} />
                      <Dropzone onDrop={ (files) => this.props.uploadImg('logo', files) } className="dropzone">
                        <div className="ant-upload ant-upload-drag" title="请拖拽或选择文"
                          style={{height: 140, marginTop: 20}}
                        >
                          <span>
                            <div className="ant-upload-drag-container">
                              <Icon type="upload" />
                              <p className="ant-upload-hint">建议使用PNG或GIF格式的透明图片</p>
                            </div>
                          </span>
                        </div>
                      </Dropzone>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="租户应用列表" labelCol={{span: 6}} wrapperCol={{span: 16}} required>
                    <CheckboxGroup options={tenantAppList}
                    {...getFieldProps('tenantAppList', {initialValue: tenantAppValueList.map(item => { return item.value; })})}
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="租户视角" labelCol={{span: 6}} wrapperCol={{span: 16}} required>
                    <RadioGroup onChange={ () => {} } {...getFieldProps('aspect', {initialValue: 0})} >
                      <RadioButton value={0}>进出口企业</RadioButton>
                      <RadioButton value={1}>物流服务商</RadioButton>
                    </RadioGroup>
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="登录入口域" labelCol={{span: 6}} wrapperCol={{span: 16}}
                    help={getFieldError('subdomain')}
                  >
                    <Input type="text" addonAfter=".welogix.cn" placeholder="请填写企业登录入口域" {...getFieldProps('subdomain')} />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="21" offset="3">
                  <Button type="primary" size="large" htmlType="submit"
                    onClick={this.handleSubmit}
                  >
                  保存
                  </Button>
                  <Button type="ghost" size="large" htmlType="submit" className="cancel"
                    onClick={this.handleCancel}
                  >
                  取消
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>);
  }
}
