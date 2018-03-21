import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Avatar, Button, Card, Icon, Layout, List } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { INTEGRATION_APPS } from 'common/constants';
import { toggleInstallAppModal } from 'common/reducers/hubIntegration';
import { connect } from 'react-redux';
import PageHeader from 'client/components/PageHeader';
import HubSiderMenu from '../menu';
import InstallAppModal from './common/installAppModal';
import { formatMsg } from './message.i18n';
import './index.less';

const { Content } = Layout;
const { SubMenu } = Menu;

@injectIntl
@connect(
  () => ({}),
  { toggleInstallAppModal }
)
export default class IntegrationAppsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: this.msg('categories'),
      catIcon: 'folder',
      appList: INTEGRATION_APPS,
    };
  }
  msg = formatMsg(this.props.intl);
  handleInstall = (link) => {
    this.context.router.push(link);
  }
  handleClick = (ev) => {
    if (ev.key === 'all') {
      this.setState({
        selectedCategory: this.msg('categories'),
        catIcon: 'folder',
        appList: INTEGRATION_APPS,
      });
    } else {
      this.setState({
        selectedCategory: this.msg(ev.key),
        catIcon: 'folder-open',
        appList: INTEGRATION_APPS.filter(app => app.category === ev.key),
      });
    }
  }
  toggleInstallAppModal = (type) => {
    this.props.toggleInstallAppModal(true, type);
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
          <PageHeader title="应用市场" />
          <Content className="page-content">
            <Card bodyStyle={{ padding: 16 }} >
              <Menu
                onClick={this.handleClick}
                mode="horizontal"
                defaultSelectedKeys={['all']}
                style={{ marginBottom: 16 }}
              >
                <Menu.Item key="all">
                  <Icon type="appstore" />{this.msg('allApps')}
                </Menu.Item>
                <SubMenu
                  title={(<span>
                    <Icon type={this.state.catIcon} />{this.state.selectedCategory}
                  </span>)}
                  onTitleClick={this.handleSubMenuClick}
                >
                  <Menu.Item key="catEnt">企业关务</Menu.Item>
                  <Menu.Item key="catCus">海关申报</Menu.Item>
                  <Menu.Item key="catSup">辅助监管</Menu.Item>
                  <Menu.Item key="catLog">物流平台</Menu.Item>
                </SubMenu>
              </Menu>
              <List
                grid={{
                  gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 6,
                }}
                dataSource={this.state.appList}
                renderItem={item => (
                  <List.Item>
                    <Card className="app-card">
                      <div className="app-logo">
                        {this.renderAppLogo(item)}
                      </div>
                      <h4 className="app-title">{item.title}</h4>
                      <div className="app-desc">{item.description}</div>
                      <Button
                        type="primary"
                        ghost
                        icon="plus-circle-o"
                        onClick={() => this.toggleInstallAppModal(item.app_type)}
                      >{this.msg('install')}</Button>
                    </Card>
                  </List.Item>
                  )}
              />
            </Card>
            <InstallAppModal />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
