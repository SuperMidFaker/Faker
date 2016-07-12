import React, { PropTypes } from 'react';

export default function RowUpdater(props) {
  const { label, onHit, onHover, row, index, ...extra } = props;
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
  return (
    <a onClick={handleClick} onMouseEnter={handleHover} {...extra} role="button">
    {label}
    </a>
  );
}

RowUpdater.propTypes = {
  label: PropTypes.string,
  onHit: PropTypes.func,
  onHover: PropTypes.func,
  row: PropTypes.object,
  index: PropTypes.number,
  extra: PropTypes.object,
};
