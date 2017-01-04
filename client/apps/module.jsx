import React, { PropTypes } from 'react';
import { locationShape } from 'react-router';
import HeaderNavBar from '../components/headerNavBar';

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
      <div className="layout-wrapper layout-fixed-sider">
        <HeaderNavBar />
        {this.props.children}
      </div>);
  }
}
