import React, { PropTypes } from 'react';

export default function RowUpdater(props) {
  const { label, onHit, onHover, row } = props;
  function handleClick() {
    if (onHit) {
      onHit(row);
    }
  }
  function handleHover() {
    if (onHover) {
      onHover(row);
    }
  }
  return (
    <a onClick={handleClick} onMouseEnter={handleHover} {...props.extra}>
    {label}
    </a>
  );
}

RowUpdater.propTypes = {
  label: PropTypes.string,
  onHit: PropTypes.func,
  onHover: PropTypes.func,
  row: PropTypes.object,
  extra: PropTypes.object,
};
