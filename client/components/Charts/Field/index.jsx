import React from 'react';
import './style.less';

const Field = ({ label, value, ...rest }) => (
  <div className="field" {...rest}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default Field;
