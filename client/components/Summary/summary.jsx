import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './index.less';

export default class Summary extends Component {
  static defaultProps = {
    prefixCls: 'welo-summary',
  };
  static propTypes = {
    children: PropTypes.any,
  }
  render() {
    const { prefixCls, children } = this.props;
    return (
      <div className={prefixCls}>
        {children}
      </div>
    );
  }
}
