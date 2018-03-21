import React from 'react';
import PropTypes from 'prop-types';

export default function Actions(props) {
  const { baseCls = 'welo-data-pane', children } = props;
  return (
    <div className={`${baseCls}-toolbar-right`}>{children}</div>
  );
}

Actions.props = {
  baseCls: PropTypes.string,
  children: PropTypes.node,
};
