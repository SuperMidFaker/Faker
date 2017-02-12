import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  Icon, Button, Form, Input, Row, Col, Layout, Select, Upload, message,
  } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import Region from '../../components/region-cascade';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
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
const { Content } = Layout;
const Option = Select.Option;
const FormItem = Form.Item;
const Dragger = Upload.Dragger;

function fetchData({ state, dispatch, cookie }) {
  const corpId = state.account.tenantId;
  if (!isFormDataLoaded(state.corps, corpId)) {
    return dispatch(loadForm(cookie, corpId));
  }
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    formData: state.corps.formData,
  }),
  { edit, checkCorpDomain })
@withPrivilege({ module: 'corp', feature: 'info' })
@Form.create()
export default class CorpInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
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
    ['country', 'province', 'city', 'district', 'logo'].forEach((fld) => {
      if (nextProps.formData[fld] !== this.props.formData[fld]) {
        newState[fld] = nextProps.formData[fld];
      }
    });
    this.setState(newState);
  }
  handleRegionChange = (region, country) => {
    const [, province, city, district, street] = region;
    this.setState({
      province,
      city,
      district,
      street,
      country,
    });
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
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { intl, formData } = this.props;
        const form = {
          ...formData,
          ...this.props.form.getFieldsValue(),
          ...this.state,
        };
        this.props.edit(form).then((result) => {
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
    const { form: { getFieldDecorator } } = this.props;
    return (
      <FormItem label={labelName} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}
        hasFeedback required={required}
      >
        {getFieldDecorator(field, { rules, ...fieldProps })(<Input type="text" placeholder={placeholder} />)}
      </FormItem>
    );
  }
  renderBasicForm() {
    const {
      formData: {
        name, short_name, address,
        code, type, remark, website,
      },
      form: { getFieldDecorator }, intl,
    } = this.props;
    const { country, province, city, district } = this.state;
    const msg = (descriptor, values) => formatMsg(intl, descriptor, values);
    return (
      <div className="page-body form-wrapper">
        <Form horizontal>
          <FormItem label={msg('enterpriseCode')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('code', { initialValue: code })(<Input type="text" disabled />)}
          </FormItem>
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
            <Region onChange={this.handleRegionChange} country={country} defaultRegion={[
              province, city, district,
            ]}
            />
          </FormItem>
          {
                this.renderTextInput(
                  msg('fullAddress'), '', 'address', false, undefined,
                  { initialValue: address }
                )
              }
          <FormItem label={msg('tradeCategory')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('type', { initialValue: type })(<Select defaultValue="lucy" style={{ width: '100%' }}>
              <Option value="freight">货代</Option>
            </Select>)}
          </FormItem>
          <FormItem label={msg('companyAbout')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('remark', { initialValue: remark })(<Input type="textarea" rows="3" />)}
          </FormItem>
          <FormItem label={msg('companyWebsite')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('website', { initialValue: website })(<Input type="text" addonBefore="http://" />)}
          </FormItem>
          <PrivilegeCover module="corp" feature="info" action="edit">
            <Row>
              <Col span="21" offset="3">
                <Button type="primary" size="large" htmlType="submit" onClick={this.handleSubmit}>
                  {formatGlobalMsg(intl, 'save')}
                </Button>
              </Col>
            </Row>
          </PrivilegeCover>
        </Form>
      </div>);
  }
  renderContactForm() {
    const {
      formData: { contact, phone, email },
      form: { getFieldDecorator }, intl,
    } = this.props;
    const msg = (descriptor, values) => formatMsg(intl, descriptor, values);
    return (
      <div className="page-body form-wrapper">
        <Form horizontal>
          {this.renderTextInput(
                msg('contact'), '', 'contact', true, [{
                  required: true,
                  message: msg('contactRequired'),
                  type: 'string',
                  whitespace: true,
                }], {
                  transform: value => (value.trim()),
                  initialValue: contact,
                }
              )}
          {this.renderTextInput(msg('phone'), '', 'phone', true, [{
            validator: (rule, value, callback) => validatePhone(
                  value, callback,
                  (msgs, descriptor) => format(msgs)(intl, descriptor)
                ),
          }], { initialValue: phone })}
          <FormItem label={msg('position')} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            {getFieldDecorator('position')(<Input type="text" />)}
          </FormItem>
          {this.renderTextInput(
                'Email', '', 'email', false,
                [{ type: 'email', message: formatContainerMsg(intl, 'emailError') }],
                { initialValue: email }
              )}
          <PrivilegeCover module="corp" feature="info" action="edit">
            <Row>
              <Col span="21" offset="3">
                <Button type="primary" size="large" htmlType="submit" onClick={this.handleSubmit}>
                  {formatGlobalMsg(intl, 'save')}
                </Button>
              </Col>
            </Row>
          </PrivilegeCover>
        </Form>
      </div>);
  }
  renderEnterpriseForm() {
    const { formData: { subdomain }, intl } = this.props;
    const msg = descriptor => formatMsg(intl, descriptor);
    return (
      <div className="page-body form-wrapper">
        <Form horizontal>
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
          <FormItem label={msg('loginSubdomain')} labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
          >
            <Input type="text" addonAfter=".welogix.cn" disabled value={subdomain} />
          </FormItem>
          <PrivilegeCover module="corp" feature="info" action="edit">
            <Row>
              <Col span="21" offset="3">
                <Button type="primary" size="large" htmlType="submit"
                  onClick={this.handleSubmit}
                >
                  {formatGlobalMsg(intl, 'save')}
                </Button>
              </Col>
            </Row>
          </PrivilegeCover>
        </Form>
      </div>);
  }
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    return (
      <Content className="main-content">
        <section className="ui-annotated-section">
          <div className="ui-annotated-section-annotation">
            <div className="ui-annotated-section-title">
              <h2>{msg('basicInfo')}</h2>
            </div>
            <div className="ui-annotated-section-description">
              <p>Shopify and your customers will use this information to contact you.</p>
            </div>
          </div>
          <div className="ui-annotated-section-content">
            {this.renderBasicForm()}
          </div>
        </section>
        <section className="ui-annotated-section">
          <div className="ui-annotated-section-annotation">
            <div className="ui-annotated-section-title">
              <h2>{msg('contactInfo')}</h2>
            </div>
            <div className="ui-annotated-section-description">
              <p>Shopify and your customers will use this information to contact you.</p>
            </div>
          </div>
          <div className="ui-annotated-section-content">
            {this.renderContactForm()}
          </div>
        </section>
        <section className="ui-annotated-section">
          <div className="ui-annotated-section-annotation">
            <div className="ui-annotated-section-title">
              <h2>{msg('brandInfo')}</h2>
            </div>
            <div className="ui-annotated-section-description">
              <p>Shopify and your customers will use this information to contact you.</p>
            </div>
          </div>
          <div className="ui-annotated-section-content">
            {this.props.formData.level === TENANT_LEVEL.ENTERPRISE && this.renderEnterpriseForm()}
          </div>
        </section>
      </Content>);
  }
}
