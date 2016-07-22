import React, { PropTypes } from 'react';
import CmsWrapper from '../common/cmsWrapper';

export default function ExportWrapper(props) {
  return <CmsWrapper type="export" {...props} />;
}

ExportWrapper.propTypes = {
  location: PropTypes.object.isRequired,
};
