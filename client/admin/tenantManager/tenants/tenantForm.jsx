import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Form, Input, Row, Col, message, Checkbox, Radio } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import { setFormValue, uploadImg, submitTenant, loadTenantForm } from
  'common/reducers/tenants';
import { checkCorpDomain } from 'common/reducers/corp-domain';
import { DEFAULT_MODULES } from 'common/constants/module';
import './tenant.less';

const Dropzone = require('react-dropzone');
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ dispatch, cookie, params }) {
  if (params.id) {
    const tenantId = params.id;
    return dispatch(loadTenantForm(cookie, tenantId));
  }
}

@connectFetch()(fetchData)
@connect(
  state => ({
    formData: state.tenants.formData,
  }),
  { uploadImg, setFormValue, submitTenant, checkCorpDomain }
)
class TenantForm extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitTenant: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    checkCorpDomain: PropTypes.func.isRequired,
    uploadImg: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleSubmit = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const formData = { ...this.props.formData, ...this.props.form.getFieldsValue() };
        formData.tenantAppList = formData.tenantAppList.map(id => ({
          id,
        }));
        if (formData.phone || formData.email) {
          this.props.submitTenant(formData).then((result) => {
            if (result.error) {
              message.error(result.error.message, 10);
            } else {
              message.info('保存成功', 5);
              this.handleNavigationTo('/manager/tenants');
            }
          });
        } else {
          message.error('电话和邮箱必须填写其中一个');
        }
      } else {
        this.forceUpdate();
        message.error('表单数据填写有误', 10);
      }
    });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const { form: { getFieldDecorator, getFieldError } } = this.props;
    return (
      <FormItem label={labelName} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}
        help={rules && getFieldError(field)} hasFeedback required={required}
      >
        {getFieldDecorator(field, { rules, ...fieldProps })(<Input type="text" placeholder={placeholder} />)}
      </FormItem>
    );
  }
  render() {
    const { formData, form: { getFieldDecorator, getFieldError } }
      = this.props;
    const tenantAppValueList = this.props.formData.tenantAppValueList || [];
    return (
      <div className="main-content">
        <div className="tenant-form page-body">
          <div className="panel-body body-responsive">
            <Form horizontal>
              <Row>
                <Col span="12">
                  {this.renderTextInput(
                    '公司名称', '请填写公司名称', 'name', true,
                    [{ required: true, message: '请填写公司名称' }],
                    { transform: value => (value.trim()), initialValue: formData.name }
                  )}
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="企业代码" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} required>
                    {getFieldDecorator('code', { transform: value => (value.trim()), initialValue: formData.code })(
                      <Input type="text" placeholder="请填写企业代码" />)}
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
                      whitespace: true,
                    }], { transform: value => (value.trim()), initialValue: formData.contact }
                  )}
                  {this.renderTextInput('电话', '请填写联系人电话', 'phone', false, [{
                    message: '请填写联系人电话',
                    type: 'string',
                    whitespace: false,
                  }], { transform: value => (value.trim()), initialValue: formData.phone })}
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  {this.renderTextInput(
                    '邮箱', '请填写联系人电子邮箱地址', 'email', false,
                    [{ type: 'email', message: '电子邮箱地址填写错误' }],
                    { transform: value => (value.trim()), initialValue: formData.email }
                  )}
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="LOGO" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} className="imgZone">
                    <img src={formData.logo || '/assets/img/wetms.png'} style={{
                      height: 120, width: 120, margin: 10,
                      border: '1px solid #e0e0e0', borderRadius: 60,
                    }} alt="logo"
                    />
                    <Dropzone onDrop={files => this.props.uploadImg('logo', files)} className="dropzone">
                      <div className="ant-upload ant-upload-drag" title="请拖拽或选择文"
                        style={{ height: 140, marginTop: 20 }}
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
                  <FormItem label="租户应用列表" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} required>
                    {getFieldDecorator('tenantAppList', { initialValue: tenantAppValueList.map((item) => { return item.id; }) })(<CheckboxGroup
                      options={Object.keys(DEFAULT_MODULES).map(mod => ({
                        value: DEFAULT_MODULES[mod].id,
                        label: DEFAULT_MODULES[mod].defaultText,
                      }))}
                    />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="租户视角" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} required>
                    {getFieldDecorator('aspect', { initialValue: formData.aspect })(<RadioGroup>
                      <RadioButton value={0}>进出口企业</RadioButton>
                      <RadioButton value={1}>物流服务商</RadioButton>
                    </RadioGroup>)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  <FormItem label="登录入口域" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}
                    help={getFieldError('subdomain')}
                  >
                    {getFieldDecorator('subdomain',
                      { transform: value => (value.trim()), initialValue: formData.subdomain })(
                        <Input type="text" addonAfter=".welogix.cn" placeholder="请填写企业登录入口域" />
                      )}
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

export default Form.create()(TenantForm);
