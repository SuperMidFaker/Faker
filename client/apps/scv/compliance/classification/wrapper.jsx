import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Menu } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/NavLink';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
@injectIntl
export default class ScvClassificationWrapper extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    menuKey: PropTypes.oneOf(['master', 'slave']),
    children: PropTypes.node.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { children, menuKey } = this.props;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {menuKey === 'master' && this.msg('masterConfig')}
              {menuKey === 'slave' && this.msg('slaveConfig')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu selectedKeys={[menuKey]} mode="inline">
                  <Menu.Item key="master"><NavLink to="/scv/classification/master">{this.msg('masterConfig')}</NavLink></Menu.Item>
                  <Menu.Item key="slave"><NavLink to="/scv/classification/slave">{this.msg('slaveConfig')}</NavLink></Menu.Item>
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
