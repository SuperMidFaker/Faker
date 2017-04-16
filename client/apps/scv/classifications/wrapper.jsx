import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Menu } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/nav-link';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
@injectIntl
export default class ScvClassificationWrapper extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    menuKey: PropTypes.oneOf(['sync']),
    children: PropTypes.node.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { children, menuKey } = this.props;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {menuKey === 'sync' && this.msg('sourceSync')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu selectedKeys={[menuKey]} mode="inline">
                  <Menu.Item key="sync"><NavLink to="/scv/classification/sync">{this.msg('sourceSync')}</NavLink></Menu.Item>
                </Menu>
              </Sider>
              {children}
            </Layout>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
