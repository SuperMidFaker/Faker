import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import './strip.less';

export default class Strip extends Component {
  static propTypes = {
    parts: PropTypes.object.isRequired,
    hints: PropTypes.array.isRequired,
  }
  renderParts = (overall, parts, hints) => {
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
          <div className={`strip-part ${item}-part`} style={{ width: `${parts[item] / total * 100}%` }} />
        </Tooltip>))
    );
  }
  render() {
    const { overall, parts, hints } = this.props;
    return (
      <div className="strip-wrap">
        {this.renderParts(overall, parts, hints)}
      </div>
    );
  }
}
