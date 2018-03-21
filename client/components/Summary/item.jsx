import React from 'react';
import PropTypes from 'prop-types';

export default function Item(props) {
  const { prefixCls = 'welo-summary-item', label, children } = props;
  return (
    <span className={`${prefixCls}`}>
      <span className={`${prefixCls}-label`} >{label}</span>
      {children}
    </span>
  );
}
Item.props = {
  prefixCls: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node,
};
