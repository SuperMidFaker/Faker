import React, { Component } from 'react';

export default class Nav extends Component {
  render() {
    return (
      <span className="welo-page-header-nav">{this.props.children}</span>
    );
  }
}
