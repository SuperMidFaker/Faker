import React, { PropTypes } from 'react';

export default function RowUpdater(props) {
  const { label, onHit, row, field, index } = props;
  function handleClick() {
    if (onHit) {
      onHit(row, field, index);
    }
  }
  return (
    <a onClick={handleClick} role="button">
      {label}
    </a>
  );
}

RowUpdater.propTypes = {
  label: PropTypes.node,
  onHit: PropTypes.func,
  row: PropTypes.object,
  index: PropTypes.number,
  field: PropTypes.string,
};
