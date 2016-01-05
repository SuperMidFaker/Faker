import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {Button} from '../../reusable/ant-ui';
import AmNavBar from '../components/am-navbar';
import NavLink from '../../reusable/components/nav-link';
import ModuleLayout from '../components/module-layout';
import './home.less';

@connect(
  state => ({
    username: state.account.username
  })
)
export default class Home extends React.Component {
  static propTypes = {
    username: PropTypes.string
  };

  render() {
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <div className="home-header">
            <img src="/assets/img/home/header-bg.jpg" />
            <div className="tenant-container">
              <img src="/assets/img/home/tenant-logo.png" />
              <h2>某某公司</h2>
            </div>
            <div className="btn-group">
              <NavLink to="/corp/info"><Button type="primary" size="large"><span>设置</span></Button></NavLink>
            </div>
          </div>
          <div className="home-body">
            <ModuleLayout size="large" />
          </div>
        </div>
      </div>);
  }
}
