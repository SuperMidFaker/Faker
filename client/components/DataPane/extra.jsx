import React, { Component } from 'react';

export default class Extra extends Component {
  static defaultProps = {
    baseCls: 'welo-data-pane',
  }
  render() {
    const { baseCls, children } = this.props;
    return (
      <div className={`${baseCls}-toolbar-extra`}>{children}</div>
    );
  }
}
