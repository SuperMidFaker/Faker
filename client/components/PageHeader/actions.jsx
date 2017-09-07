import React, { Component } from 'react';

export default class Actions extends Component {
  render() {
    return (
      <div className="page-header-actions">{this.props.children}</div>
    );
  }
}
