import React, { PropTypes } from 'react';
import CmsWrapper from '../common/cmsWrapper';

export default function ImportWrapper(props) {
  return <CmsWrapper type="import" {...props} />;
}

ImportWrapper.propTypes = {
  location: PropTypes.object.isRequired,
};
