import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Menu, Icon, Layout } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;


@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class Settings extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }

  msg = key => formatMsg(this.props.intl, key);

  render() {
    return (
      <Layout>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('settings')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('integration')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              开放API
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu
                  onClick={this.handleClick}
                  defaultOpenKeys={['integration']}
                  defaultSelectedKeys={['openapi']}
                  mode="inline"
                >
                  <SubMenu key="integration" title={<span><Icon type="cloud-o" /><span>{this.msg('integration')}</span></span>}>
                    <Menu.Item key="openapi">开放API</Menu.Item>
                    <Menu.Item key="2">EDI</Menu.Item>
                  </SubMenu>
                  <Menu.Item key="notification"><span><Icon type="notification" /><span>通知提醒</span></span></Menu.Item>
                </Menu>
              </Sider>
              <Content style={{ padding: '0 24px', minHeight: 280 }}>
                  content
              </Content>
            </Layout>
          </div>
        </Content>
      </Layout>
    );
  }
}
