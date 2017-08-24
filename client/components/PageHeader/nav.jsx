import React, { Component } from 'react';

export default class Nav extends Component {
  render() {
    return (
      <span>{this.props.children}</span>
    );
  }
}
