import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tag } from 'antd';

export default function MdIcon(props) {
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
