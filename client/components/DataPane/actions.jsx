import React, { Component } from 'react';

export default class Actions extends Component {
  static defaultProps = {
    baseCls: 'welo-data-pane',
  }
  render() {
    const { baseCls, children } = this.props;
    return (
      <div className={`${baseCls}-toolbar-right`}>{children}</div>
    );
  }
}
