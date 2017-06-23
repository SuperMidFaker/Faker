import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import './stripe.less';

export default class Stripe extends Component {
  static propTypes = {
    parts: PropTypes.object.isRequired,
    hints: PropTypes.array.isRequired,
  }
  handleParts = (overall, parts, hints) => {
    let total = overall;
    if (!overall) {
      total = Object.values(parts).reduce((pre, curr) =>
        pre + curr
      );
    }
    const keys = Object.keys(parts);
    return (
      keys.map((item, index) => (
        <Tooltip title={hints[index]}>
          <div className={'stripe-part success-part'} style={{ width: `${parts[item] / total * 100}%` }} />
        </Tooltip>))
    );
  }
  render() {
    const { overall, parts, hints } = this.props;
    const children = this.handleParts(overall, parts, hints);
    return (
      <div className="stripe-wrap">
        {children}
      </div>
    );
  }
}
