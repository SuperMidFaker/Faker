import React from 'react';
import PropTypes from 'prop-types';

export default function Content(props) {
  const { children, extraContent } = props;
  return (
    <div className="row">
      <div className="welo-page-header-content">{children}</div>
      {extraContent && <div className="welo-page-header-extra">{extraContent}</div>}
    </div>
  );
}
Content.props = {
  children: PropTypes.node,
  extraContent: PropTypes.node,
};
