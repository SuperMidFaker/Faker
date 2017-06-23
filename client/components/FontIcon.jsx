import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';

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

export function Fontello(props) {
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

Fontello.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'orange', 'red', 'gray']),
  tagWrapped: PropTypes.bool,
};

export function Ikons(props) {
  const { type, tagWrapped } = props;
  const icon = (<i className={`icon icon-ikons-${type}`} />);
  return tagWrapped ? <Tag>{icon}</Tag> : icon;
}

Ikons.propTypes = {
  type: PropTypes.string.isRequired,
  tagWrapped: PropTypes.bool,
};
