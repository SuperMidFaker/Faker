import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Avatar, Card, Button, Form, Input, Row, Col, Layout, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import PageHeader from 'client/components/PageHeader';
import InfoItem from 'client/components/InfoItem';
import { isFormDataLoaded, loadForm, edit } from 'common/reducers/corps';
import AvatarUploader from 'client/components/AvatarUploader';
import { checkCorpDomain } from 'common/reducers/corp-domain';
import { format } from 'client/common/i18n/helpers';
import CorpSiderMenu from './menu';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const FormItem = Form.Item;

function fetchData({ state, dispatch, cookie }) {
  const corpId = state.account.tenantId;
  if (!isFormDataLoaded(state.corps, corpId)) {
    return dispatch(loadForm(cookie, corpId));
  }
  return null;
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    formData: state.corps.formData,
  }),
  { edit, checkCorpDomain }
)
@withPrivilege({ module: 'corp', feature: 'info' })
@Form.create()
export default class CorpInfo extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({
      getFieldDecorator: PropTypes.func,
    }).isRequired,
    formData: PropTypes.shape({
      name: PropTypes.string,
      shortName: PropTypes.string,
      code: PropTypes.string,
      remark: PropTypes.string,
    }).isRequired,
    edit: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    const {
      country, province, city, district, logo,
    } = this.props.formData;
    this.state = {
      country, province, city, district, logo,
    };
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
  handleImgUpload = (url) => {
    this.setState({
      logo: url,
    });
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
      <FormItem
        label={labelName}
        required={required}
      >
        {getFieldDecorator(field, { rules, ...fieldProps })(<Input placeholder={placeholder} />)}
      </FormItem>
    );
  }
  renderBasicForm() {
    const {
      formData: {
        name, shortName, code, remark,
      },
      form: { getFieldDecorator }, intl,
    } = this.props;
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
                msg('companyShortName'), '', 'shortName', false,
                [{
                  type: 'string',
                  min: 2,
                  pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
                  message: msg('shortNameMessage'),
                }],
                { initialValue: shortName }
              )}
            </Col>
            <Col sm={24} md={24}>
              <FormItem label={msg('companyAbout')} >
                {getFieldDecorator('remark', { initialValue: remark })(<Input.TextArea rows="2" />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <PrivilegeCover module="corp" feature="info" action="edit">
              <Button
                type="primary"
                htmlType="submit"
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
        <InfoItem
          type="select"
          label="企业归属"
          placeholder="选择企业拥有者"
          addonBefore={<Avatar size="small" >{contact}</Avatar>}
          field={contact}
          action={<Button type="primary" ghost disabled>移交</Button>}
        />
        {/* <InfoItem
          label="删除企业"
          field="一旦你删除了企业，企业内所有数据内容都将会被永久删除并不可恢复，请谨慎对待！"
          action={<Button type="danger" >删除企业</Button>}
        /> */}
      </Card>);
  }
  render() {
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    return (
      <Layout>
        <CorpSiderMenu currentKey="info" />
        <Layout>
          <PageHeader title={msg('corpInfo')} />
          <Content className="page-content layout-fixed-width layout-fixed-width-lg" key="main">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                {this.renderBasicForm()}
                {this.renderMoreActions()}
              </Col>
              <Col sm={24} md={8}>
                <Card title={msg('brandInfo')}>
                  <Form layout="vertical">
                    <FormItem>
                      <AvatarUploader url={this.state.logo} afterUpload={this.handleImgUpload} />
                    </FormItem>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
