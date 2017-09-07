import React, { Component } from 'react';

export default class Title extends Component {
  render() {
    return (
      <div className="page-header-title">{this.props.children}</div>
    );
  }
}
