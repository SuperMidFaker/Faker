import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from '../components/am-navbar';

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
              <div className="center-container">
              <img url="" />
              <span></span>
              </div>
            </div>
            <div className="home-body">
              <ul>
                <li><img /><sapn></span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>);
  }
}
