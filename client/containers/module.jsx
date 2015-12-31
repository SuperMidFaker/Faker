import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmNavBar from '../components/am-navbar';

@connect(
  state => ({
    username: state.account.username
  })
)
export default class Module extends React.Component {
  static propTypes = {
    username: PropTypes.string,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <AmNavBar locationPath={this.props.location.pathname}/>
        {this.props.children}
      </div>);
  }
}
