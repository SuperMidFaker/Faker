import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapse, Button, Card, Breadcrumb, Icon, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import { getApp } from 'common/reducers/devApp';
import ProfileForm from './forms/profileForm';
import OAuthForm from './forms/oAuthForm';
import WebHookForm from './forms/webHookForm';
import EntranceForm from './forms/entranceForm';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { Panel } = Collapse;

@injectIntl
@connect(
  state => ({
    app: state.devApp.app,
  }),
  { getApp }
)
export default class ConfigDevApp extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.getApp(this.props.router.params.appId);
  }
  msg = formatMsg(this.props.intl);
  handleClose = () => {
    this.context.router.goBack();
  }
  render() {
    const { app } = this.props;
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="code-o" /> {this.msg('dev')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {app.app_name}
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
                <ProfileForm app={app} />
              </Panel>
              <Panel header="OAuth2 配置" key="oauth">
                <OAuthForm app={app} />
              </Panel>
              <Panel header="Webhook 配置" key="webhook">
                <WebHookForm app={app} />
              </Panel>
              <Panel header="入口配置" key="entrance">
                <EntranceForm app={app} />
              </Panel>
            </Collapse>
          </Card>
        </Content>
      </Layout>
    );
  }
}
