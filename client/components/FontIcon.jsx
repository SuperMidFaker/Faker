import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';

export function MdIcon(props) {
  const { type, tagWrapped } = props;
  const icon = (<i className={`zmdi zmdi-${type}`} />);
  return tagWrapped ? <Tag>{icon}</Tag> : icon;
}

MdIcon.propTypes = {
  type: PropTypes.string.isRequired,
  tagWrapped: PropTypes.bool,
};

export function Logixon(props) {
  const { type, tagWrapped, color } = props;
  let colorString = null;
  switch (color) {
    case 'blue':
      colorString = '#108ee9';
      break;
    case 'green':
      colorString = '#00a854';
      break;
    case 'orange':
      colorString = '#f56a00';
      break;
    case 'red':
      colorString = '#f04134';
      break;
    case 'gray':
      colorString = '#d9d9d9';
      break;
    default:
      break;
  }
  const style = colorString ? { ...props.style, color: colorString } : { ...props.style };
  const icon = (<i className={`icon logixon icon-${type}`} style={style} />);
  return tagWrapped ? <Tag>{icon}</Tag> : icon;
}

Logixon.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'orange', 'red', 'gray']),
  tagWrapped: PropTypes.bool,
};
