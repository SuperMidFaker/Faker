import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Form, Icon, Input, Col, Layout, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { installArCtmApp } from 'common/reducers/openIntegration';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import MainForm from './forms/mainForm';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    partners: state.partner.partners,
  }),
  { installArCtmApp, loadPartners }
)
@Form.create()
export default class InstallAmberRoadCTM extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role: PARTNER_ROLES.CUS,
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    });
  }
  msg = formatMsg(this.props.intl)
  handleInstallBtnClick = () => {
    this.props.form.validateFields((err, values) => {
      const partner = this.props.partners.filter(pt => pt.id === values.customer_partner_id)[0];
      const arctm = {
        name: values.name,
        ccb_tenant_id: this.props.tenantId,
        ccb_name: this.props.tenantName,
        user: values.username,
        password: values.password,
        customer_tenant_id: partner.partner_tenant_id,
        customer_partner_id: partner.id,
        customer_name: partner.name,
        uuid: values.uuid,
        webservice_url: values.webservice_url,
        app_type: 'ARCTM',
        tenant_id: this.props.tenantId,
      };
      this.props.installArCtmApp(arctm).then((result) => {
        if (!result.erorr) {
          this.context.router.goBack();
        }
      });
    });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, partners } = this.props;
    const formPartners = partners.map(pt => ({ code: pt.partner_code, id: pt.id, name: pt.name }));
    const formData = {
      customer_partner_id: partners.length > 0 ? partners[0].id : undefined,
    };
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="appstore-o" />{this.msg('integration')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appsStore')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appAmberRoadCTM')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" onClick={this.handleInstallBtnClick}>
              {this.msg('installApp')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Form vertical>
            <Row gutter={16}>
              <Col sm={24} lg={24}>
                <FormItem label={this.msg('integrationName')}>
                  {form.getFieldDecorator('name', {
                    rules: [{ required: true, message: this.msg('integrationNameRequired') }],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <MainForm form={form} partners={formPartners} formData={formData} />
          </Form>
        </Content>
      </div>
    );
  }
}
