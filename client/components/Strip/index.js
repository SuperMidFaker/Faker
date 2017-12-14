import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import './index.less';

export default class Strip extends Component {
  static propTypes = {
    parts: PropTypes.object.isRequired,
    hints: PropTypes.array.isRequired,
  }
  renderParts = (overall, parts, hints) => {
    let total = Object.values(parts).reduce((pre, curr) =>
      pre + curr, 0);
    if (overall && total < overall) {
      total = overall;
    }
    const keys = Object.keys(parts);
    return (
      keys.map((item, index) => (
        <Tooltip title={`${hints[index]} ${parts[item]}`} key={item}>
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
