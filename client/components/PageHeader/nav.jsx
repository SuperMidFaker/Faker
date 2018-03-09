import React from 'react';
import PropTypes from 'prop-types';

export default function Nav(props) {
  return (
    <span className="welo-page-header-nav">{props.children}</span>
  );
}
Nav.props = {
  children: PropTypes.node,
};
