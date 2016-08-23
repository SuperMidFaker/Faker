import React, { PropTypes } from 'react';

export default function RowUpdater(props) {
  const { label, onHit, row, index } = props;
  function handleClick() {
    if (onHit) {
      onHit(row, index);
    }
  }
  return (
    <a onClick={handleClick} role="button">
    {label}
    </a>
  );
}

RowUpdater.propTypes = {
  label: PropTypes.element,
  onHit: PropTypes.func,
  row: PropTypes.object,
  index: PropTypes.number,
};
