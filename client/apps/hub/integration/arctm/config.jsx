import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Card, Form, Icon, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import InfoItem from 'client/components/InfoItem';
import { loadArCtmApp, updateArCtmApp } from 'common/reducers/openIntegration';
import MainForm from './forms/mainForm';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;

function fetchData({ dispatch, params }) {
  return dispatch(loadArCtmApp(params.uuid));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    role: state.account.role_name,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    code: state.account.code,
    arctm: state.openIntegration.arctm,
  }),
  { loadArCtmApp, updateArCtmApp }
)
@Form.create()
export default class ConfigAmberRoadCTM extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleSaveBtnClick = () => {
    this.props.form.validateFields((err, values) => {
      const arctm = {
        user: values.username,
        password: values.password,
        webservice_url: values.webservice_url,
        uuid: values.uuid,
      };
      this.props.updateArCtmApp(arctm).then((result) => {
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
    const { form, submitting, arctm } = this.props;
    const formPartners = [{ id: arctm.customer_partner_id, name: arctm.customer_name }];
    const formData = {
      customer_partner_id: arctm.customer_partner_id,
      user: arctm.user,
      password: arctm.password,
      uuid: arctm.uuid,
      webservice_url: arctm.webservice_url,
    };
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="appstore-o" /> {this.msg('integration')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appAmberRoadCTM')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {arctm.name}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools" >
            <Button type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
              {this.msg('saveApp')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Form layout="vertical">
            <Card>
              <InfoItem label={this.msg('integrationName')} field={arctm.name} />
            </Card>
            <Card title={this.msg('AmberRoadCTMParam')}>
              <MainForm form={form} partners={formPartners} formData={formData} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
