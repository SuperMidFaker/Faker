import React from 'react';
import PropTypes from 'prop-types';


export default function Toolbar(props) {
  const { baseCls = 'welo-data-pane', children } = props;
  return (
    <div className={`${baseCls}-toolbar`}>
      {children}
    </div>
  );
}

Toolbar.props = {
  baseCls: PropTypes.string,
  children: PropTypes.node,
};
