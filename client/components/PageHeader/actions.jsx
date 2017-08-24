import React, { Component } from 'react';

export default class Actions extends Component {
  render() {
    return (
      <div className="page-header-tools">{this.props.children}</div>
    );
  }
}
