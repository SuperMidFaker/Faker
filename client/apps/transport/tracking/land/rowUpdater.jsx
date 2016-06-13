import React, { PropTypes } from 'react';

export default function RowUpdater(props) {
  const { label, onAnchored, row, anchorProps } = props;
  function handleClick() {
    if (onAnchored) {
      onAnchored(row);
    }
  }
  function handleHover() {
    if (anchorProps && anchorProps.onHover) {
      anchorProps.onHover(row);
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
  row: PropTypes.object,
};
