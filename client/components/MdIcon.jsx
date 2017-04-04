import React, { PropTypes } from 'react';

export default function MdIcon(props) {
  const { type } = props;
  return (<i className={`zmdi zmdi-${type}`} />);
}

MdIcon.propTypes = {
  type: PropTypes.string,
};
