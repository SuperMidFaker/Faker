import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';

export default function RowUpdater(props) {
  const { label, onHit, onHover, row, index, tooltip, ...extra } = props;
  function handleClick(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (onHit) {
      onHit(row, index, extra);
    }
  }
  function handleHover() {
    if (onHover) {
      onHover(row, index);
    }
  }
  return tooltip ?
    <Tooltip title={tooltip}>
      <a onClick={handleClick} onMouseEnter={handleHover} {...extra} role="presentation">
        {label}
      </a>
    </Tooltip> :
    <a onClick={handleClick} onMouseEnter={handleHover} {...extra} role="presentation">
      {label}
    </a>;
}

RowUpdater.propTypes = {
  label: PropTypes.any,
  onHit: PropTypes.func,
  onHover: PropTypes.func,
  row: PropTypes.object,
  index: PropTypes.number,
  extra: PropTypes.object,
  tooltip: PropTypes.string,
};
