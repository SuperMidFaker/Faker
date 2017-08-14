import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Menu } from 'antd';
import QueueAnim from 'rc-queue-anim';
import NavLink from 'client/components/NavLink';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
@injectIntl
export default class ScvResourceWrapper extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    menuKey: PropTypes.oneOf(['warehouse', 'serviceprovider', 'forwareder', 'supplier']),
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
              {menuKey === 'warehouse' && '仓库'}
              {menuKey === 'serviceprovider' && '服务商'}
              {menuKey === 'forwarder' && '货代'}
              {menuKey === 'supplier' && '供应商'}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu selectedKeys={[menuKey]} mode="inline">
                  <Menu.Item key="warehouse"><NavLink to="/scv/resources/warehouse">仓库</NavLink></Menu.Item>
                  <Menu.Item key="serviceprovider"><NavLink to="/scv/resources/serviceprovider">服务商</NavLink></Menu.Item>
                  <Menu.Item key="forwarder" disabled><NavLink to="/scv/resources/forwarder">货代</NavLink></Menu.Item>
                  <Menu.Item key="supplier" disabled><NavLink to="/scv/resources/supplier">供应商</NavLink></Menu.Item>
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
