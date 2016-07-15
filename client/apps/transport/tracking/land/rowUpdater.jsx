import React, { PropTypes } from 'react';

export default function RowUpdater(props) {
  const { label, onAnchored, row, onHover, ...anchorProps } = props;
  function handleClick(ev) {
    if (onAnchored) {
      onAnchored(row, ev);
    }
  }
  function handleHover() {
    if (onHover) {
      onHover(row);
    }
  }
  return <a onClick={handleClick} onMouseEnter={handleHover} {...anchorProps}>{label}</a>;
}

RowUpdater.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  onAnchored: PropTypes.func,
  onHover: PropTypes.func,
  row: PropTypes.object,
};
