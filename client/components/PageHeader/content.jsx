import React, { Component } from 'react';

export default class Content extends Component {
  render() {
    const { children, extraContent } = this.props;
    return (
      <div className="row">
        <div className="welo-page-header-content">{children}</div>
        {extraContent && <div className="welo-page-header-extra">{extraContent}</div>}
      </div>
    );
  }
}
