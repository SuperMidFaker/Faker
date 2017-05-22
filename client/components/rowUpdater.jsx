import React, { PropTypes } from 'react';
import { Tooltip } from 'antd';

export default function RowUpdater(props) {
  const { label, onHit, onHover, row, index, tooltip, ...extra } = props;
  function handleClick() {
    if (onHit) {
      onHit(row, index);
    }
  }
  function handleHover() {
    if (onHover) {
      onHover(row, index);
    }
  }
  return tooltip ?
    <Tooltip title={tooltip}>
      <a onClick={handleClick} onMouseEnter={handleHover} {...extra} href>
        {label}
      </a>
    </Tooltip> :
    <a onClick={handleClick} onMouseEnter={handleHover} {...extra} href>
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
