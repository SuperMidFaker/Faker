import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Avatar, Breadcrumb, Button, Card, Icon, Layout, List } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { INTEGRATION_APPS } from 'common/constants';
import HubSiderMenu from '../menu';
import { formatMsg } from './message.i18n';
import './index.less';

const { Header, Content } = Layout;
const { SubMenu } = Menu;

@injectIntl
export default class IntegrationAppsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleInstall = (link) => {
    this.context.router.push(link);
  }
  renderAppLogo(app) {
    if (app.app_type === 'EASIPASS') {
      return <Avatar shape="square" style={{ backgroundColor: '#008dff' }}>EP</Avatar>;
    } else if (app.app_type === 'ARCTM') {
      return <Avatar shape="square" style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>AmberRoad</Avatar>;
    } else if (app.app_type === 'SHFTZ') {
      return <Avatar shape="square" style={{ backgroundColor: '#00a2ae' }}>FTZ</Avatar>;
    } else if (app.app_type === 'SFEXPRESS') {
      return <Avatar shape="square" style={{ backgroundColor: '#292929' }}>SF</Avatar>;
    } else if (app.app_type === 'SW') {
      return <Avatar shape="square" style={{ backgroundColor: '#f56a00' }}>SW</Avatar>;
    } else if (app.app_type === 'QP') {
      return <Avatar shape="square" style={{ backgroundColor: '#7265e6' }}>QP</Avatar>;
    }
    return <Avatar shape="square">{this.msg('unknownApp')}</Avatar>;
  }
  render() {
    return (
      <Layout>
        <HubSiderMenu currentKey="apps" />
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="shop" /> 应用市场
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="page-header-tools" />
          </Header>
          <Content className="main-content">
            <Card bodyStyle={{ padding: 16 }} >
              <Menu
                onClick={this.handleClick}
                mode="horizontal"
                defaultActiveKey="all"
                style={{ marginBottom: 16 }}
              >
                <Menu.Item key="all">
                  <Icon type="appstore" />{this.msg('allApps')}
                </Menu.Item>
                <SubMenu title={<span><Icon type="folder" />{this.msg('categories')}</span>}>
                  <Menu.Item key="category:1">企业关务</Menu.Item>
                  <Menu.Item key="category:2">海关申报</Menu.Item>
                  <Menu.Item key="category:3">辅助监管</Menu.Item>
                  <Menu.Item key="category:4">物流平台</Menu.Item>
                </SubMenu>
              </Menu>
              <List
                grid={{ gutter: 16, column: 6 }}
                dataSource={INTEGRATION_APPS}
                renderItem={item => (
                  <List.Item>
                    <Card title={item.title} className="app-card">
                      <div className="app-logo">
                        {this.renderAppLogo(item)}
                      </div>
                      <div className="app-desc">{item.description}</div>
                      <Button type="primary" ghost icon="tool" onClick={() => this.handleInstall(item.link)}>安装</Button>
                    </Card>
                  </List.Item>
                  )}
              />
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
