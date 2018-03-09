import React from 'react';
import PropTypes from 'prop-types';

export default function Extra(props) {
  const { baseCls = 'welo-form-pane', children } = props;
  return (
    <div className={`${baseCls}-toolbar-extra`}>{children}</div>
  );
}

Extra.props = {
  baseCls: PropTypes.string,
  children: PropTypes.node,
};
