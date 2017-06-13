import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tag } from 'antd';

export function MdIcon(props) {
  const { mode, type, tagWrapped } = props;
  let icon = '';
  switch (mode) {
    case 'ikons':
      icon = (<i className={`icon icon-ikons-${type}`} />);
      break;
    case 'fontello':
      icon = (<i className={`icon icon-fontello-${type}`} />);
      break;
    case 'antd':
      icon = (<Icon type={type} />);
      break;
    default:
      icon = (<i className={`zmdi zmdi-${type}`} />);
      break;
  }
  return tagWrapped ? <Tag>{icon}</Tag> : icon;
}

MdIcon.propTypes = {
  type: PropTypes.string.isRequired,
  mode: PropTypes.string,
  tagWrapped: PropTypes.bool,
};

export function FtIcon(props) {
  const { type, color, tagWrapped } = props;
  let colorString = '#000';
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
    default:
      colorString = '#d9d9d9';
  }
  const icon = (<i className={`icon icon-fontello-${type}`} style={{ color: colorString }} />);
  return tagWrapped ? <Tag>{icon}</Tag> : icon;
}

FtIcon.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'orange', 'red', 'gray']),
  tagWrapped: PropTypes.bool,
};
