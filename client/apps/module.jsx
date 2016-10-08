import React, { PropTypes } from 'react';
import { locationShape } from 'react-router';
import AmNavBar from '../components/am-navbar';

export default class Module extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    location: locationShape.isRequired,
  }
  static childContextTypes = {
    location: locationShape.isRequired,
  }
  getChildContext() {
    return { location: this.props.location };
  }

  render() {
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <AmNavBar />
        {this.props.children}
      </div>);
  }
}
