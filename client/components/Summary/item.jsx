import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Item extends Component {
  static defaultProps = {
    prefixCls: 'welo-summary-item',
  };
  static propTypes = {
    label: PropTypes.string,
  }
  render() {
    const { prefixCls, label } = this.props;
    return (
      <span className={`${prefixCls}`}>
        <span className={`${prefixCls}-label`} >{label}</span>
        {this.props.children}
      </span>
    );
  }
}
