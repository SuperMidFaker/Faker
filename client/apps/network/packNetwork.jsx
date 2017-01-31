import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon, Layout } from 'antd';
import NavLink from 'client/components/nav-link';
import CorpHeaderBar from 'client/components/corpHeaderBar';
import { setNavTitle } from 'common/reducers/navbar';

const { Sider, Header, Content } = Layout;

@connect()
export default class CollabNetworkPack extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.dispatch(setNavTitle({
      depth: 1,
    }));
  }
  render() {
    return (
      <Layout className="layout-wrapper">
        <Header>
          <CorpHeaderBar title="协作网络" />
        </Header>
        <Layout>
          <Sider className="menu-sider">
            <Menu defaultSelectedKeys={['partners']} mode="inline">
              <Menu.Item key="partners">
                <NavLink to="/network/partners">
                  <span><Icon type="team" /><span>合作伙伴</span></span>
                </NavLink>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content className="main-content">
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}
