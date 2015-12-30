import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from '../components/am-navbar';

@connect(
  state => ({
    username: state.account.username
  })
)
export default class Account extends React.Component {
  static propTypes = {
    username: PropTypes.string,
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <div className="main-content">
          {this.props.children}
          </div>
        </div>
      </div>);
  }
}
