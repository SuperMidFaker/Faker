import React, { PropTypes } from 'react';
import { Icon } from 'antd';

export default function MdIcon(props) {
  const { mode, type } = props;
  switch (mode) {
    case 'ikons':
      return (<i className={`icon icon-ikons-${type}`} />);
    case 'fontello':
      return (<i className={`icon icon-fontello-${type}`} />);
    case 'antd':
      return (<Icon type={type} />);
    default:
      return (<i className={`zmdi zmdi-${type}`} />);
  }
}

MdIcon.propTypes = {
  type: PropTypes.string.isRequired,
  mode: PropTypes.string,
};
