import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Card, Collapse, Icon, Layout, Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadArCtmApp, updateArCtmApp } from 'common/reducers/openIntegration';
import PageHeader from 'client/components/PageHeader';
import ProfileForm from '../common/profileForm';
import ParamsForm from './forms/paramsForm';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;
const { Panel } = Collapse;

function fetchData({ dispatch, params }) {
  return dispatch(loadArCtmApp(params.uuid));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    app: state.openIntegration.currentApp,
    arctm: state.openIntegration.arctm,
  }),
  { loadArCtmApp, updateArCtmApp }
)
export default class ConfigAmberRoadCTM extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleClose = () => {
    this.context.router.goBack();
  }
  renderStatusTag(enabled) {
    return enabled ? <Tag color="green">{this.msg('appEnabled')}</Tag> : <Tag>{this.msg('appDisabled')}</Tag>;
  }
  render() {
    const { arctm, app } = this.props;
    const formPartners = [{ id: arctm.customer_partner_id, name: arctm.customer_name }];
    const formData = {
      customer_partner_id: arctm.customer_partner_id,
      user: arctm.user,
      password: arctm.password,
      uuid: arctm.uuid,
      webservice_url: arctm.webservice_url,
    };
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="appstore-o" /> {this.msg('integration')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('appAmberRoadCTM')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {arctm.name} {this.renderStatusTag(app.enabled)}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button icon="close" onClick={this.handleClose}>
              {this.msg('close')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-fixed-width">
          <Card bodyStyle={{ padding: 0 }}>
            <Collapse accordion bordered={false} defaultActiveKey={['profile']}>
              <Panel header="基本信息" key="profile">
                <ProfileForm app={arctm} />
              </Panel>
              <Panel header="参数配置" key="params">
                <ParamsForm partners={formPartners} formData={formData} />
              </Panel>
            </Collapse>
          </Card>
        </Content>
      </Layout>
    );
  }
}
