import React from 'react';
import PropTypes from 'prop-types';

export default function Actions(props) {
  return (
    <div className="welo-page-header-actions">{props.children}</div>
  );
}
Actions.props = {
  children: PropTypes.node,
};
