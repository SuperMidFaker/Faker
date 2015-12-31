import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from '../components/am-navbar';
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
          <div className="main-content">
            <div className="home-header">
              <div className="corp-container">
                <img src="/assets/img/home/logo.png" />
                <span></span>
              </div>
            </div>
            <div className="home-body">
              <ModuleLayout size="large" />
            </div>
          </div>
        </div>
      </div>);
  }
}
