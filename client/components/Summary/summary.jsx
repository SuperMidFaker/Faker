import React from 'react';
import PropTypes from 'prop-types';
import './style.less';

export default function Summary(props) {
  const { prefixCls = 'welo-summary', children } = props;
  return (
    <div className={prefixCls}>
      {children}
    </div>
  );
}

Summary.props = {
  prefixCls: PropTypes.string,
  children: PropTypes.node,
};
