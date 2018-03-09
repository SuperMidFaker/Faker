import React from 'react';
import PropTypes from 'prop-types';
import './style.less';

export default function EmptyState(props) {
  const {
    header, description,
    imageUrl, maxImageWidth = 160, maxImageHeight = 160,
    primaryAction, secondaryAction,
  } = props;
  return (
    <div className="welo-empty-state">
      {imageUrl && <img src={imageUrl} alt="img" style={{ maxWidth: maxImageWidth, maxHeight: maxImageHeight }} />}
      <h4>{header}</h4>
      {description && <p>{description}</p>}
      <div>
        {primaryAction}{secondaryAction}
      </div>
    </div>
  );
}

EmptyState.props = {
  header: PropTypes.string.isRequired,
  description: PropTypes.string,
  imageUrl: PropTypes.string,
  maxImageWidth: PropTypes.number,
  maxImageHeight: PropTypes.number,
  primaryAction: PropTypes.node,
  secondaryAction: PropTypes.node,
};
