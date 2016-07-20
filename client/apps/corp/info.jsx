import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  Icon, Button, Form, Input, Row, Col, Select, Tabs, Upload, message,
  } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import Region from '../../components/region-cascade';
import connectFetch from 'client/common/decorators/connect-fetch';
import { setNavTitle } from 'common/reducers/navbar';
import connectNav from 'client/common/decorators/connect-nav';
import { isFormDataLoaded, loadForm, edit } from
  'common/reducers/corps';
import { checkCorpDomain } from 'common/reducers/corp-domain';
import { validatePhone } from 'common/validater';
import { TENANT_LEVEL } from '../../../common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/apps/message.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);
const Option = Select.Option;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Dragger = Upload.Dragger;

function fetchData({ state, dispatch, cookie }) {
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
    goBackFn: '',
  }));
})
@connect(
  state => ({
    formData: state.corps.formData,
  }),
  { edit, checkCorpDomain })
@Form.create({
  formPropName: 'formhoc',
})
export default class CorpInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    edit: PropTypes.func.isRequired,
    checkCorpDomain: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    const { country, province, city, district, logo } = this.props.formData;
    this.state = { country, province, city, district, logo };
  }
  componentWillReceiveProps(nextProps) {
    const newState = this.state;
    ['country', 'province', 'city', 'district', 'logo'].forEach(fld => {
      if (nextProps.formData[fld] !== this.props.formData[fld]) {
        newState[fld] = nextProps.formData[fld];
      }
    });
    this.setState(newState);
  }
  handleRegionChange = (field, value) => {
    this.setState({ [field]: value });
  }
  handleImgUpload = (upinfo) => {
    const file = upinfo.file;
    if (file.status === 'done') {
      if (file.response.status === 200) {
        this.setState({
          logo: file.response.data,
        });
      } else {
        message.error(file.response.msg);
      }
    }
  }
  handleSubmit = () => {
    this.props.formhoc.validateFields((errors) => {
      if (!errors) {
        const { intl, formhoc, formData } = this.props;
        const form = {
          ...formData,
          ...formhoc.getFieldsValue(),
          ...this.state,
        };
        this.props.edit(form).then(result => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info(formatMsg(intl, 'updateSuccess'), 5);
          }
        });
      } else {
        this.forceUpdate();
      }
    });
  }
  handleCancel() {
    this.context.router.goBack();
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const { formhoc: { getFieldProps } } = this.props;
    return (
      <FormItem label={labelName} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}
        hasFeedback required={required}
      >
        <Input type="text" placeholder={placeholder} {
          ...getFieldProps(field, { rules, ...fieldProps })
        } />
      </FormItem>
    );
  }
  renderBasicForm() {
    const {
      formData: {
        name, short_name, address,
        code, type, remark, website, contact, phone, email,
      },
      formhoc: { getFieldProps }, intl,
    } = this.props;
    const { country, province, city, district } = this.state;
    const msg = (descriptor, values) => formatMsg(intl, descriptor, values);
    return (
      <div className="panel-body body-responsive">
        <Form horizontal form={this.props.formhoc} className="form-edit-content">
          <Row>
            <Col span="12">
              {this.renderTextInput(
                msg('companyName'), msg('companyNameTip'), 'name', true,
                [{ required: true, message: msg('companyNameRequired') }],
                { initialValue: name }
              )}
              {this.renderTextInput(
                msg('companyShortName'), '', 'short_name', false,
                [{
                  type: 'string', min: 2, pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
                  message: msg('shortNameMessage'),
                }],
                { initialValue: short_name }
              )}
              <FormItem label={msg('location')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                <Region withCountry setFormValue={this.handleRegionChange} region={{
                  country, province, city, district,
                }} />
              </FormItem>
              {
                this.renderTextInput(
                  msg('fullAddress'), '', 'address', false, undefined,
                  { initialValue: address }
                )
              }
            </Col>
            <Col span="12">
              <FormItem label={msg('enterpriseCode')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                <Input type="text" disabled {...getFieldProps('code', { initialValue: code })} />
              </FormItem>
              <FormItem label={msg('tradeCategory')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                <Select defaultValue="lucy" style={{ width: '100%' }}
                  {...getFieldProps('type', { initialValue: type })}
                >
                  <Option value="freight">货代</Option>
                </Select>
              </FormItem>
              <FormItem label={msg('companyAbout')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                <Input type="textarea" rows="3" {...getFieldProps('remark', { initialValue: remark })} />
              </FormItem>
              <FormItem label={msg('companyWebsite')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                <Input type="text" addonBefore="http://" {
                  ...getFieldProps('website', { initialValue: website })
                } />
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
                  whitespace: true,
                }], {
                  transform: (value) => (value.trim()),
                  initialValue: contact,
                }
              )}
              {this.renderTextInput(msg('phone'), '', 'phone', true, [{
                validator: (rule, value, callback) => validatePhone(
                  value, callback,
                  (msgs, descriptor) => format(msgs)(intl, descriptor)
                ),
              }], { initialValue: phone })}
            </Col>
            <Col span="12">
              <FormItem label={msg('position')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                <Input type="text" {...getFieldProps('position')} />
              </FormItem>
              {this.renderTextInput(
                'Email', '', 'email', false,
                [{ type: 'email', message: formatContainerMsg(intl, 'emailError') }],
                { initialValue: email }
              )}
            </Col>
          </Row>
          <Row>
            <Col span="21" offset="3">
              <Button type="primary" size="large" htmlType="submit" onClick={this.handleSubmit}>
              {formatGlobalMsg(intl, 'save')}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>);
  }
  renderEnterpriseForm() {
    const { formData: { subdomain }, intl } = this.props;
    const msg = (descriptor) => formatMsg(intl, descriptor);
    return (
      <div className="panel-body body-responsive">
        <Form horizontal className="form-edit-content">
          <Row>
            <Col span="12">
              <FormItem label="LOGO" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <img src={this.state.logo || '/assets/img/wetms.png'} style={{
                  height: 120, width: 120, margin: 10,
                  border: '1px solid #e0e0e0', borderRadius: 60,
                }} alt="logo"
                />
                <div title={msg('dragHint')} style={{ height: 140, marginTop: 20 }}>
                  <Dragger onChange={this.handleImgUpload} showUploadList={false}
                    action={`${API_ROOTS.default}v1/upload/img`} withCredentials
                  >
                    <Icon type="upload" />
                    <p className="ant-upload-hint">{msg('imgUploadHint')}</p>
                  </Dragger>
                </div>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="12">
              <FormItem label={msg('loginSubdomain')} labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
              >
                <Input type="text" addonAfter=".welogix.cn" disabled value={subdomain} />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="21" offset="3">
              <Button type="primary" size="large" htmlType="submit"
                onClick={this.handleSubmit}
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
