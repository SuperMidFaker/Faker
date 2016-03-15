import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Form, Input, Row, Col, Select, Tabs, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import Region from '../../components/region-cascade';
import connectFetch from '../../../reusable/decorators/connect-fetch';
import { setNavTitle } from '../../../universal/redux/reducers/navbar';
import connectNav from '../../../reusable/decorators/connect-nav';
import { isFormDataLoaded, loadForm, setFormValue, uploadImg, edit } from
  '../../../universal/redux/reducers/corps';
import { checkCorpDomain } from '../../../universal/redux/reducers/corp-domain';
import { validatePhone } from '../../../reusable/common/validater';
import { TENANT_LEVEL } from '../../../universal/constants';
const Dropzone = require('react-dropzone');
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
import containerMessages from 'client/containers/message.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);
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
@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'corpInfo'),
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: ''
  }));
})
@connect(
  state => ({
    formData: state.corps.formData
  }),
  { uploadImg, setFormValue, edit, checkCorpDomain })
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
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    setFormValue: PropTypes.func.isRequired,
    checkCorpDomain: PropTypes.func.isRequired,
    uploadImg: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  handleSubmit() {
    const { intl } = this.props;
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        this.props.edit(this.props.formData).then(result => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info(formatMsg(intl, 'updateSuccess'), 5);
          }
        });
      } else {
        this.forceUpdate();
        message.error(formatMsg(intl, 'formValidateErr'), 10);
      }
    });
  }
  handleCancel() {
    this.context.router.goBack();
  }
  /*
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
  */
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const {formhoc: {getFieldProps, getFieldError}} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 16}}
      help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  renderBasicForm() {
    const { formData: { country, province, city, district }, formhoc: { getFieldProps }, intl }
      = this.props;
    const msg = (descriptor, values) => formatMsg(intl, descriptor, values);
    return (
      <div className="panel-body body-responsive">
      <Form horizontal form={this.props.formhoc}>
        <Row>
          <Col span="12">
            {this.renderTextInput(
              msg('companyName'), msg('companyNameTip'), 'name', true,
              [{required: true, message: msg('companyNameRequired')}]
            )}
            {this.renderTextInput(
              msg('companyShortName'), '', 'short_name', false,
              [{ type: 'string', min: 2, pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
                message: msg('shortNameMessage')}]
            )}
            <FormItem label={msg('location')} labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Region setFormValue={this.props.setFormValue} region={{
                country, province, city, county: district}} />
            </FormItem>
            {this.renderTextInput(msg('fullAddress'), '', 'address')}
          </Col>
          <Col span="12">
            <FormItem label={msg('enterpriseCode')} labelCol={{span: 6}} wrapperCol={{span: 18}}
              required
            >
              <Col span="18">
                <Input type="text" disabled {...getFieldProps('code')} />
              </Col>
              <Col span="6">
                <p className="ant-form-text">
                  <a role="button">{msg('applyChange')}</a>
                </p>
              </Col>
            </FormItem>
            <FormItem label={msg('tradeCategory')} labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Select defaultValue="lucy" style={{width:'100%'}} {...getFieldProps('type')}>
                <Option value="freight">货代</Option>
              </Select>
            </FormItem>
            <FormItem label={msg('companyAbout')} labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Input type="textarea" rows="3" {...getFieldProps('remark')} />
            </FormItem>
            <FormItem label={msg('companyWebsite')} labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Input type="text" addonBefore="http://" {...getFieldProps('website')} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            {this.renderTextInput(
              msg('contact'), '', 'contact', true, [{
                required: true,
                message: msg('contactRequired'),
                type: 'string',
                whitespace: true
              }], {transform: (value) => (value.trim())}
            )}
            {this.renderTextInput(msg('phone'), '', 'phone', true, [{
              validator: (rule, value, callback) => validatePhone(
                value, callback,
                (msgs, descriptor) => format(msgs)(intl, descriptor)
              )
            }])}
          </Col>
          <Col span="12">
            <FormItem label={msg('position')} labelCol={{span: 6}} wrapperCol={{span: 16}}>
              <Input type="text" {...getFieldProps('position')} />
            </FormItem>
            {this.renderTextInput(
              'Email', '', 'email', false,
              [{type: 'email', message: formatContainerMsg(intl, 'emailError')}]
            )}
          </Col>
        </Row>
        <Row>
          <Col span="21" offset="3">
            <Button type="primary" size="large" htmlType="submit" onClick={() => this.handleSubmit()}>
            {formatGlobalMsg(intl, 'save')}
            </Button>
          </Col>
        </Row>
      </Form>
      </div>);
  }
  renderEnterpriseForm() {
    const {formData: { logo: logoPng }, formhoc: { getFieldProps, getFieldError }, intl } = this.props;
    const msg = (descriptor) => formatMsg(intl, descriptor);
    return (
      <div className="panel-body body-responsive">
        <Form horizontal>
          <Row>
            <Col span="12">
              <FormItem label="LOGO" labelCol={{span: 6}} wrapperCol={{span: 18}}>
                  <img src={logoPng || '/assets/img/wetms.png'} style={{
                    height: 120, width: 120, margin: 10,
                    border: '1px solid #e0e0e0', borderRadius: 60
                  }}
                  />
                  <Dropzone onDrop={ (files) => this.props.uploadImg('logo', files) } style={{}}>
                    <div className="ant-upload ant-upload-drag" title={msg('dragHint')}
                      style={{height: 140, marginTop: 20}}
                    >
                      <span>
                        <div className="ant-upload-drag-container">
                          <Icon type="upload" />
                          <p className="ant-upload-hint">{msg('imgUploadHint')}</p>
                        </div>
                      </span>
                    </div>
                  </Dropzone>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem label={msg('loginSubdomain')} labelCol={{span: 6}} wrapperCol={{span: 16}}
                help={getFieldError('subdomain')}
              >
                <Input type="text" addonAfter=".welogix.cn" disabled {...getFieldProps('subdomain')} />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="21" offset="3">
              <Button type="primary" size="large" htmlType="submit"
                onClick={() => this.handleSubmit()}
              >
              {formatGlobalMsg(intl, 'save')}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>);
  }
  render() {
    const msg = (descriptor) => formatMsg(this.props.intl, descriptor);
    return (
      <div className="main-content">
        <div className="page-body">
          <Tabs defaultActiveKey="tab1">
            <TabPane tab={msg('basicInfo')} key="tab1">{this.renderBasicForm()}</TabPane>
            <TabPane tab={msg('brandInfo')} key="tab2">
            {this.props.formData.level === TENANT_LEVEL.ENTERPRISE && this.renderEnterpriseForm()}
            </TabPane>
          </Tabs>
        </div>
      </div>);
  }
}
