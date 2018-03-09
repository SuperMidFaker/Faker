import React from 'react';
import PropTypes from 'prop-types';

export default function Title(props) {
  return (
    <div className="welo-page-header-title">{props.children}</div>
  );
}
Title.props = {
  children: PropTypes.node,
};
