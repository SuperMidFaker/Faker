import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'antd';
import NavLink from 'client/components/nav-link';
import AmNavBar from 'client/components/am-navbar';
import { setNavTitle } from 'common/reducers/navbar';

@connect()
export default class MessagePack extends React.Component {
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
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <aside className="side-bar no-left-menu no-top-bar">
            <h2>消息中心</h2>
            <Menu defaultSelectedKeys={['message']} mode="inline">
              <Menu.Item key="message">
                <NavLink to="/list">
                  <span><Icon type="message" /><span>消息列表</span></span>
                </NavLink>
              </Menu.Item>
            </Menu>
          </aside>
          <div className="main-content no-top-bar with-side-bar">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
