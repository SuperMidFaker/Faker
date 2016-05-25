import React, { PropTypes } from 'react';

export default function RowUpdater(props) {
  const { label, onAnchored, row } = props;
  function handleClick() {
    if (onAnchored) {
      onAnchored(row);
    }
  }
  return <a onClick={handleClick}>{label}</a>;
}

RowUpdater.propTypes = {
  label: PropTypes.string.isRequired,
  onAnchored: PropTypes.func,
  row: PropTypes.object,
};
