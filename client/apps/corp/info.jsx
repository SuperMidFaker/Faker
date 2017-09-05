import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Avatar, Breadcrumb, Card, Icon, Button, Form, Input, Row, Col, Layout, Select, Upload, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import ChinaRegionCascader from '../../components/chinaRegionCascader';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import InfoItem from 'client/components/InfoItem';
import { isFormDataLoaded, loadForm, edit } from
  'common/reducers/corps';
import { checkCorpDomain } from 'common/reducers/corp-domain';
import { TENANT_LEVEL } from '../../../common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
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
        message.error(file.response.msg, 10);
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
      <FormItem label={labelName}
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
      <Card title={msg('basicInfo')}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col sm={24} md={24}>
              {this.renderTextInput(
                msg('companyName'), msg('companyNameTip'), 'name', true,
                [{ required: true, message: msg('companyNameRequired') }],
                { initialValue: name }
              )}
            </Col>
            <Col sm={24} md={12}>
              <FormItem label={msg('enterpriseCode')} >
                {getFieldDecorator('code', { initialValue: code })(<Input type="text" disabled />)}
              </FormItem>
            </Col>

            <Col sm={24} md={12}>
              {this.renderTextInput(
                msg('companyShortName'), '', 'short_name', false,
                [{
                  type: 'string',
                  min: 2,
                  pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
                  message: msg('shortNameMessage'),
                }],
                { initialValue: short_name }
              )}
            </Col>
            <Col sm={24} md={24}>
              <FormItem label={msg('location')} >
                <ChinaRegionCascader onChange={this.handleRegionChange} country={country} defaultRegion={[
                  province, city, district,
                ]}
                />
              </FormItem>
            </Col>
            <Col sm={24} md={24}>
              {
                this.renderTextInput(
                  msg('fullAddress'), '', 'address', false, undefined,
                  { initialValue: address }
                )
              }
            </Col>
            <Col sm={24} md={12}>
              <FormItem label={msg('tradeCategory')} >
                {getFieldDecorator('type', { initialValue: type })(<Select style={{ width: '100%' }}>
                  <Option value="freight">货代</Option>
                </Select>)}
              </FormItem>
            </Col>
            <Col sm={24} md={12}>
              <FormItem label={msg('companyWebsite')} >
                {getFieldDecorator('website', { initialValue: website })(<Input type="text" addonBefore="http://" />)}
              </FormItem>
            </Col>
            <Col sm={24} md={24}>
              <FormItem label={msg('companyAbout')} >
                {getFieldDecorator('remark', { initialValue: remark })(<Input.TextArea rows="3" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <PrivilegeCover module="corp" feature="info" action="edit">
              <Button type="primary" size="large" htmlType="submit"
                onClick={this.handleSubmit}
              >
                {msg('save')}
              </Button>
            </PrivilegeCover>
          </Row>
        </Form>
      </Card>);
  }
  renderMoreActions() {
    const {
      formData: { contact }, intl,
    } = this.props;
    const msg = (descriptor, values) => formatMsg(intl, descriptor, values);
    return (
      <Card title={msg('moreActions')}>
        <InfoItem type="select" label="企业归属" placeholder="选择企业拥有者"
          addonBefore={<Avatar size="small" >{contact}</Avatar>}
          field={contact}
          action={<Button type="primary" size="large" ghost disabled>移交</Button>}
        />
        {/* <InfoItem
          label="删除企业"
          field="一旦你删除了企业，企业内所有数据内容都将会被永久删除并不可恢复，请谨慎对待！"
          action={<Button type="danger" size="large">删除企业</Button>}
        /> */}
      </Card>);
  }
  renderEnterpriseForm() {
    const { intl } = this.props;
    const msg = descriptor => formatMsg(intl, descriptor);
    return (
      <Card title={msg('brandInfo')}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col sm={24} md={24}>
              <FormItem label="LOGO">
                <img src={this.state.logo || '/assets/img/wetms.png'} style={{
                  height: 120,
                  width: 120,
                  margin: 10,
                  border: '1px solid #e0e0e0',
                  borderRadius: 60,
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
        </Form>
      </Card>);
  }
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <i className="icon-fontello-building" /> {msg('corpInfo')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools" />
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg" key="main">
          <Row gutter={16}>
            <Col sm={24} md={16}>
              {this.renderBasicForm()}
              {this.renderMoreActions()}
            </Col>
            <Col sm={24} md={8}>
              {this.props.formData.level === TENANT_LEVEL.ENTERPRISE && this.renderEnterpriseForm()}
            </Col>
          </Row>
        </Content>
      </QueueAnim>);
  }
}
